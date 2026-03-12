"""
Google Maps Scraper - Main scraping logic using Playwright.

Scrapes business listings from Google Maps for configured zones and queries,
extracting contact details, ratings, social media links, and more.
"""

import re
from datetime import datetime

from config import (
    SELECTORS,
    DELAYS,
    QUERY_TEMPLATES,
    ZONAS,
    MAX_RETRIES,
    MAX_SCROLL_ATTEMPTS,
    CHECKPOINT_INTERVAL,
)
from utils import (
    get_random_ua,
    random_delay,
    setup_logger,
    save_checkpoint,
    load_checkpoint,
    is_captcha_page,
)


class GoogleMapsScraper:
    def __init__(self, headless=True, log_dir='data/logs'):
        self.headless = headless
        self.logger = setup_logger('scraper', log_dir)
        self.results = []
        self.seen_keys = set()  # For deduplication: (name_lower, address_lower)
        self.browser = None
        self.context = None
        self.page = None
        self.pw = None
        self.queries_done = 0
        self.queries_total = 0

    async def start(self):
        """Launch browser with Playwright."""
        from playwright.async_api import async_playwright

        self.pw = await async_playwright().start()
        self.browser = await self.pw.chromium.launch(headless=self.headless)
        await self._new_context()
        self.logger.info("Browser iniciado correctamente")

    async def _new_context(self):
        """Create a fresh browser context and page."""
        self.context = await self.browser.new_context(
            user_agent=get_random_ua(),
            viewport={'width': 1920, 'height': 1080},
            locale='es-AR',
            timezone_id='America/Argentina/Buenos_Aires',
            geolocation={'latitude': -34.6037, 'longitude': -58.3816},
            permissions=['geolocation'],
        )
        self.page = await self.context.new_page()

        # Accept cookies on first Maps visit
        try:
            await self.page.goto('https://www.google.com/maps', wait_until='domcontentloaded', timeout=60000)
            await self.page.wait_for_timeout(3000)
            accept_btn = self.page.locator(
                'button:has-text("Aceptar todo"), button:has-text("Accept all")'
            )
            if await accept_btn.count() > 0:
                await accept_btn.first.click()
                await random_delay(1, 2)
        except Exception:
            pass

    async def stop(self):
        """Close browser."""
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self.pw:
            await self.pw.stop()
            self.pw = None
        self.logger.info("Browser cerrado")

    async def search(self, query):
        """Execute a search query on Google Maps via direct URL."""
        import urllib.parse
        encoded = urllib.parse.quote(query)
        url = f'https://www.google.com/maps/search/{encoded}/'
        await self.page.goto(url, wait_until='domcontentloaded', timeout=60000)
        # Wait for results feed to appear
        try:
            await self.page.wait_for_selector(SELECTORS['results_container'], timeout=15000)
        except Exception:
            # May be a single result or no results — continue anyway
            pass
        await random_delay(*DELAYS['page_load'])
        self.logger.info(f"Busqueda: {query}")

    async def scroll_results(self):
        """Scroll the results panel to load all results."""
        results_panel = self.page.locator(SELECTORS['results_container'])
        if await results_panel.count() == 0:
            self.logger.warning("No se encontró panel de resultados")
            return

        last_count = 0
        scroll_attempts = 0

        while scroll_attempts < MAX_SCROLL_ATTEMPTS:
            # Scroll down in the results panel
            await results_panel.evaluate('el => el.scrollTop = el.scrollHeight')
            await random_delay(*DELAYS['scroll_pause'])

            # Check if we've reached the end
            end_marker = self.page.locator(SELECTORS['end_of_list'])
            if await end_marker.count() > 0:
                self.logger.info("Fin de la lista de resultados alcanzado")
                break

            # Check if new results loaded
            items = self.page.locator(SELECTORS['result_item_alt'])
            current_count = await items.count()

            if current_count == last_count:
                scroll_attempts += 1
                if scroll_attempts >= 3:
                    break
            else:
                scroll_attempts = 0
                last_count = current_count

        self.logger.info(f"Total resultados visibles: {last_count}")

    async def extract_place_details(self):
        """Extract details from the currently open place detail panel."""
        data = {
            "nombre": "",
            "direccion": "",
            "localidad": "",
            "partido": "",
            "zona": "",
            "telefono": "",
            "telefono2": "",
            "celular_whatsapp": "",
            "email": "",
            "sitio_web": "",
            "google_maps_url": "",
            "rating": "",
            "cantidad_resenas": "",
            "categoria_google": "",
            "horarios": "",
            "instagram": "",
            "facebook": "",
            "descripcion": "",
            "fotos_url": [],
            "query_origen": "",
            "fecha_scraping": "",
            "coordenadas_lat": "",
            "coordenadas_lng": "",
        }

        # Name
        try:
            name_el = self.page.locator(SELECTORS['place_name'])
            if await name_el.count() > 0:
                data['nombre'] = (await name_el.first.text_content()).strip()
            else:
                name_el = self.page.locator(SELECTORS['place_name_alt'])
                if await name_el.count() > 0:
                    data['nombre'] = (await name_el.first.text_content()).strip()
        except Exception:
            pass

        # Rating
        try:
            rating_el = self.page.locator(SELECTORS['rating'])
            if await rating_el.count() > 0:
                data['rating'] = (await rating_el.first.text_content()).strip().replace(',', '.')
        except Exception:
            pass

        # Reviews count
        try:
            reviews_el = self.page.locator(SELECTORS['reviews_count'])
            if await reviews_el.count() > 0:
                label = await reviews_el.first.get_attribute('aria-label')
                if label:
                    nums = re.findall(r'[\d.,]+', label.replace('.', '').replace(',', ''))
                    if nums:
                        data['cantidad_resenas'] = nums[0]
        except Exception:
            pass

        # Category
        try:
            cat_el = self.page.locator(SELECTORS['category'])
            if await cat_el.count() > 0:
                data['categoria_google'] = (await cat_el.first.text_content()).strip()
        except Exception:
            pass

        # Address
        try:
            addr_el = self.page.locator(SELECTORS['address'])
            if await addr_el.count() > 0:
                data['direccion'] = (await addr_el.first.text_content()).strip()
            else:
                addr_el = self.page.locator(SELECTORS['address_alt'])
                if await addr_el.count() > 0:
                    data['direccion'] = (await addr_el.first.text_content()).strip()
        except Exception:
            pass

        # Phone(s)
        try:
            phone_els = self.page.locator(SELECTORS['phone'])
            count = await phone_els.count()
            if count > 0:
                data['telefono'] = (await phone_els.first.text_content()).strip()
                if count > 1:
                    data['telefono2'] = (await phone_els.nth(1).text_content()).strip()
            else:
                phone_els = self.page.locator(SELECTORS['phone_alt'])
                count = await phone_els.count()
                if count > 0:
                    data['telefono'] = (await phone_els.first.text_content()).strip()
        except Exception:
            pass

        # Website
        try:
            web_el = self.page.locator(SELECTORS['website'])
            if await web_el.count() > 0:
                data['sitio_web'] = await web_el.first.get_attribute('href') or ''
            else:
                web_el = self.page.locator(SELECTORS['website_alt'])
                if await web_el.count() > 0:
                    data['sitio_web'] = await web_el.first.get_attribute('href') or ''
        except Exception:
            pass

        # Hours
        try:
            hours_el = self.page.locator(SELECTORS['hours'])
            if await hours_el.count() > 0:
                label = await hours_el.first.get_attribute('aria-label')
                if label:
                    data['horarios'] = label.strip()
        except Exception:
            pass

        # Current URL (contains coordinates)
        try:
            url = self.page.url
            data['google_maps_url'] = url
            coord_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
            if coord_match:
                data['coordenadas_lat'] = coord_match.group(1)
                data['coordenadas_lng'] = coord_match.group(2)
        except Exception:
            pass

        # Timestamp
        data['fecha_scraping'] = datetime.now().isoformat()

        return data

    async def extract_social_from_website(self, url):
        """Fetch website and extract social media links."""
        social = {
            "instagram": "",
            "facebook": "",
            "whatsapp": "",
            "tiktok": "",
            "youtube": "",
        }
        if not url or not url.startswith('http'):
            return social

        try:
            page = await self.context.new_page()
            await page.goto(url, wait_until='domcontentloaded', timeout=5000)
            content = await page.content()
            await page.close()

            # Instagram
            ig_match = re.search(
                r'(?:https?://)?(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)', content
            )
            if ig_match:
                social['instagram'] = f"https://instagram.com/{ig_match.group(1)}"

            # Facebook
            fb_match = re.search(
                r'(?:https?://)?(?:www\.)?facebook\.com/([a-zA-Z0-9_.]+)', content
            )
            if fb_match:
                social['facebook'] = f"https://facebook.com/{fb_match.group(1)}"

            # WhatsApp
            wa_match = re.search(
                r'(?:https?://)?(?:wa\.me|api\.whatsapp\.com/send\?phone=)(\d+)', content
            )
            if wa_match:
                social['whatsapp'] = wa_match.group(1)

            # TikTok
            tt_match = re.search(
                r'(?:https?://)?(?:www\.)?tiktok\.com/@([a-zA-Z0-9_.]+)', content
            )
            if tt_match:
                social['tiktok'] = f"https://tiktok.com/@{tt_match.group(1)}"

            # YouTube
            yt_match = re.search(
                r'(?:https?://)?(?:www\.)?youtube\.com/(?:c/|channel/|@)([a-zA-Z0-9_-]+)',
                content,
            )
            if yt_match:
                social['youtube'] = f"https://youtube.com/@{yt_match.group(1)}"

        except Exception:
            pass  # Silently fail for website fetching

        return social

    async def _collect_result_urls(self):
        """Collect all place URLs from the results panel (links inside result cards)."""
        urls = []
        # Each result card has an <a> with an href to the place
        links = self.page.locator('div.Nv2PK a[href*="/maps/place/"]')
        count = await links.count()
        for i in range(count):
            href = await links.nth(i).get_attribute('href')
            if href and href not in urls:
                urls.append(href)
        return urls

    async def scrape_query(self, query, zona_name, localidad):
        """Scrape all results for a single query."""
        retries = 0
        while retries < MAX_RETRIES:
            try:
                await self.search(query)

                # Check for captcha
                if await is_captcha_page(self.page):
                    self.logger.warning("CAPTCHA detectado, esperando...")
                    await self.page.wait_for_timeout(int(DELAYS['captcha_wait'] * 1000))
                    retries += 1
                    continue

                # Scroll to load all results
                await self.scroll_results()

                # Collect all place URLs first (avoids stale locator issues)
                place_urls = await self._collect_result_urls()
                self.logger.info(f"Encontrados {len(place_urls)} resultados para: {query}")

                for i, place_url in enumerate(place_urls):
                    try:
                        # Navigate directly to each place
                        await self.page.goto(place_url, wait_until='domcontentloaded', timeout=30000)
                        await self.page.wait_for_timeout(2000)

                        # Extract details
                        place_data = await self.extract_place_details()
                        place_data['query_origen'] = query
                        place_data['zona'] = zona_name
                        place_data['localidad'] = localidad
                        place_data['google_maps_url'] = place_url

                        # Dedup check
                        key = (
                            place_data['nombre'].lower().strip(),
                            place_data['direccion'].lower().strip(),
                        )
                        if key[0] and key not in self.seen_keys:
                            self.seen_keys.add(key)

                            # Try to get social media from website
                            if place_data.get('sitio_web'):
                                social = await self.extract_social_from_website(
                                    place_data['sitio_web']
                                )
                                place_data['instagram'] = social.get('instagram', '')
                                place_data['facebook'] = social.get('facebook', '')
                                if social.get('whatsapp'):
                                    place_data['celular_whatsapp'] = social['whatsapp']

                            self.results.append(place_data)
                            self.logger.info(
                                f"  [{len(self.results)}] {place_data['nombre']}"
                                f" - {place_data['direccion']}"
                            )

                            # Checkpoint
                            if len(self.results) % CHECKPOINT_INTERVAL == 0:
                                save_checkpoint(self.results, 'data/checkpoint.json')
                                self.logger.info(
                                    f"Checkpoint guardado: {len(self.results)} resultados"
                                )

                        await random_delay(*DELAYS['between_clicks'])

                    except Exception as e:
                        self.logger.error(f"  Error en resultado {i}: {str(e)[:100]}")
                        continue

                break  # Success, exit retry loop

            except Exception as e:
                retries += 1
                self.logger.error(
                    f"Error en query '{query}' (intento {retries}): {str(e)[:150]}"
                )
                await random_delay(DELAYS['error_retry'], DELAYS['error_retry'] + 5)

                # Rotate user agent on retry
                try:
                    await self.context.close()
                except Exception:
                    pass
                await self._new_context()

    async def scrape_zona(self, zona_name, localidades=None):
        """Scrape all queries for a specific zona."""
        if localidades is None:
            localidades = ZONAS.get(zona_name, [])

        total_queries = len(localidades) * len(QUERY_TEMPLATES)
        self.logger.info(
            f"=== Iniciando zona: {zona_name}"
            f" ({len(localidades)} localidades, {total_queries} queries) ==="
        )

        for loc in localidades:
            for template in QUERY_TEMPLATES:
                query = template.format(zona=loc)
                self.queries_done += 1
                self.logger.info(
                    f"[{self.queries_done}/{self.queries_total}] Procesando: {query}"
                )

                await self.scrape_query(query, zona_name, loc)
                await random_delay(*DELAYS['between_searches'])

        # Save checkpoint after each zona
        save_checkpoint(self.results, 'data/checkpoint.json')
        self.logger.info(
            f"=== Zona {zona_name} completada. Total acumulado: {len(self.results)} ==="
        )

    async def scrape_all(self, zonas=None, resume=False):
        """Scrape all configured zones."""
        if resume:
            self.results = load_checkpoint('data/checkpoint.json')
            self.seen_keys = {
                (r['nombre'].lower().strip(), r['direccion'].lower().strip())
                for r in self.results
            }
            self.logger.info(
                f"Resumiendo desde checkpoint: {len(self.results)} resultados previos"
            )

        if zonas is None:
            zonas = list(ZONAS.keys())

        # Calculate total queries
        self.queries_total = sum(
            len(ZONAS.get(z, [])) * len(QUERY_TEMPLATES) for z in zonas
        )
        self.queries_done = 0

        await self.start()

        try:
            for zona in zonas:
                await self.scrape_zona(zona)
        finally:
            # Always save and close
            save_checkpoint(self.results, 'data/checkpoint.json')
            await self.stop()

        return self.results
