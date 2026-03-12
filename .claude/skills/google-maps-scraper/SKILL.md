---
name: google-maps-scraper
description: >
  Scraper universal de Google Maps para generacion de leads comerciales.
  Busca negocios por rubro y zona geografica, extrae datos de contacto
  (telefono, email, web, redes sociales), enriquece visitando sitios web,
  y exporta a JSON/CSV/Excel. Adaptable a cualquier industria y ubicacion.
disable-model-invocation: false
argument-hint: "<rubro>" "<zona>" [--headless] [--resume] [--enrich] [--export]
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, TaskOutput, TaskStop, Agent
---

# Google Maps Lead Scraper - Universal

Scraper de Google Maps para generacion de leads comerciales, adaptable a cualquier rubro y zona geografica.

## Procedimiento completo (probado y validado)

Este skill ejecuta un pipeline de 4 fases que fue desarrollado y probado exitosamente,
obteniendo 1700+ leads con 274 emails y 1568 telefonos en una sola zona.

---

## FASE 0: Configuracion del proyecto

Antes de scrapear, hay que adaptar el scraper al rubro y zona del usuario.

### 0.1 Crear estructura de archivos

Si no existe `scraper/`, crear la siguiente estructura:

```
scraper/
  config.py      # Zonas, queries, selectores, delays
  scraper.py     # Logica principal del scraper (Playwright)
  parser.py      # Limpieza, deduplicacion, normalizacion
  exporter.py    # Exportacion a XLSX/CSV/JSON
  enrich_leads.py # Enriquecimiento de emails desde sitios web
  utils.py       # User agents, delays, logging, checkpoints
  main.py        # Punto de entrada
  requirements.txt
  data/          # Checkpoints y outputs
    output/
    logs/
```

### 0.2 Adaptar `config.py` al rubro y zona solicitados

El usuario debe proporcionar:
1. **Rubro** (ej: "repuestos automotor", "ferreterias", "restaurantes", "clinicas veterinarias")
2. **Zona geografica** (ej: "AMBA", "Cordoba Capital", "Rosario", o pais/ciudad especifica)

Con esa info, generar en `config.py`:

```python
# ZONAS: dict de nombre_zona -> lista de localidades/barrios
ZONAS = {
    "Zona Oeste": ["Ituzaingo", "Moron", "Castelar", ...],
    "Zona Sur": ["Lanus", "Avellaneda", ...],
    # ... adaptar a la geografia del usuario
}

# QUERY_TEMPLATES: lista de busquedas, {zona} se reemplaza por cada localidad
QUERY_TEMPLATES = [
    "casa de repuestos automotor en {zona}",  # Adaptar al rubro
    "autopartes en {zona}",
    "repuestos de suspension en {zona}",
    # Incluir 3-5 variaciones relevantes al rubro
]

# RELEVANT_CATEGORIES: categorias de Google Maps que son relevantes
RELEVANT_CATEGORIES = [
    "repuesto", "autopart", "taller", ...  # Adaptar al rubro
]

# EXCLUDE_CATEGORIES: categorias a excluir (falsos positivos)
EXCLUDE_CATEGORIES = [
    "restaurant", "hotel", "farmacia", ...  # Lo que NO es relevante
]
```

**IMPORTANTE sobre QUERY_TEMPLATES:**
- Usar 3-5 variaciones de busqueda relevantes al rubro
- Incluir terminos especificos del nicho (no solo genericos)
- Cada query genera N resultados por localidad, mas queries = mas resultados pero mas tiempo

### 0.3 Adaptar coordenadas y locale

En `scraper.py`, el metodo `_new_context()` tiene configuracion de geolocalizacion:

```python
geolocation={'latitude': -34.6037, 'longitude': -58.3816},  # Buenos Aires
locale='es-AR',
timezone_id='America/Argentina/Buenos_Aires',
```

Adaptar a la ubicacion real del usuario para que Google Maps muestre resultados locales.

---

## FASE 1: Instalacion de dependencias

```bash
cd scraper
python -m pip install playwright pandas openpyxl beautifulsoup4
playwright install chromium
```

**Problemas conocidos y soluciones:**
- Si `python` y `pip` apuntan a versiones distintas: usar `python -m pip install ...`
- Si Playwright no instala Chromium: verificar permisos y espacio en disco
- En Windows, el encoding de consola (cp1252) no soporta emoji: usar texto plano en logs

---

## FASE 2: Scraping de Google Maps

### Ejecucion

```bash
cd scraper
python main.py --zona "Zona Oeste" --headless --resume
```

### Argumentos
- `--zona "Nombre"`: Scrapear solo una zona especifica
- `--headless`: Sin ventana del navegador (por defecto)
- `--no-headless`: Con ventana visible (para debug)
- `--resume`: Continuar desde el ultimo checkpoint

### Como funciona (tecnicas clave)

1. **Navegacion por URL directa** (no usar la barra de busqueda):
   ```python
   url = f'https://www.google.com/maps/search/{urllib.parse.quote(query)}/'
   await page.goto(url, wait_until='domcontentloaded', timeout=60000)
   ```
   Razon: El input de busqueda de Google Maps es inestable en headless mode.

2. **Recolectar URLs antes de visitar** (no hacer click/back):
   ```python
   # Primero: scroll para cargar todos los resultados
   # Segundo: recolectar todas las URLs de los resultados
   urls = await self._collect_result_urls()  # div.Nv2PK a[href*="/maps/place/"]
   # Tercero: visitar cada URL directamente
   for url in urls:
       await page.goto(url, ...)
       data = await self.extract_place_details()
   ```
   Razon: El patron click->extract->back causa locators stale y timeouts.

3. **Rotacion de contexto en errores**:
   - Si una query falla, cerrar el contexto del browser y crear uno nuevo
   - Rotar user-agent en cada nuevo contexto
   - Maximo 3 reintentos por query

4. **wait_until='domcontentloaded'** (NUNCA 'networkidle'):
   - Google Maps hace requests constantes, 'networkidle' nunca resuelve

5. **Checkpoint cada 50 resultados**:
   - Guarda progreso en `data/checkpoint.json`
   - Permite `--resume` si se interrumpe

6. **Archivo STOP para detener entre zonas**:
   - Crear `data/STOP` para que el scraper pare despues de la zona actual
   - Se elimina automaticamente al detectarlo

### Selectores CSS actualizados (Google Maps 2025-2026)

```python
SELECTORS = {
    "results_container": 'div[role="feed"]',
    "result_item_alt": 'div.Nv2PK',
    "place_name": 'h1.DUwDvf',
    "rating": 'div.F7nice span[aria-hidden="true"]',
    "reviews_count": 'div.F7nice span[aria-label]',
    "category": 'button.DkEaL',
    "address": 'button[data-item-id="address"] div.fontBodyMedium',
    "phone": 'button[data-item-id^="phone"] div.fontBodyMedium',
    "website": 'a[data-item-id="authority"]',
    "hours": 'div[aria-label*="horario"], div[aria-label*="hours"]',
    "end_of_list": 'span.HlvSq',
}
```

**NOTA**: Estos selectores pueden cambiar si Google actualiza Maps. Si el scraper deja
de encontrar resultados, verificar los selectores en DevTools.

### Rendimiento esperado

| Metrica | Valor tipico |
|---------|-------------|
| Resultados por query | 5-20 |
| Tiempo por query | 15-30 seg |
| Queries por zona (25 localidades x 5 templates) | 125 |
| Resultados unicos por zona | 500-2000 |
| Leads con telefono | 90-95% |
| Leads con sitio web | 40-50% |
| Tiempo total por zona | 1-3 horas |

---

## FASE 3: Enriquecimiento de emails

Despues del scraping, ejecutar el enricher para extraer emails de los sitios web:

```bash
cd scraper
python enrich_leads.py
```

### Como funciona

1. Carga el `checkpoint.json` con todos los leads
2. Filtra los que tienen `sitio_web` pero no `email`
3. Para cada sitio web:
   - Abre la pagina con Playwright (timeout 8s)
   - Extrae emails con regex del HTML completo
   - Filtra dominios falsos (sentry, wixpress, example.com, etc.)
   - Prioriza emails de contacto (info@, ventas@, contacto@, hola@)
   - Extrae telefonos extra del texto visible
   - Corrige handles de Instagram falsos
4. Guarda resultados actualizados en checkpoint y en archivo enriched

### Limpieza post-enrichment

Despues del enricher, limpiar emails falsos positivos:

```python
bad_patterns = [
    'sentry', 'wixpress', 'ejemplo', 'example', 'nombre@',
    'logo_large', '@2x.webp', 'tucorreo@', 'freehtml5',
    'paginadigital', 'gurusoluciones', '%20'
]
```

### Rendimiento esperado del enricher

| Metrica | Valor tipico |
|---------|-------------|
| Tasa de emails encontrados | 25-35% de los que tienen web |
| Emails validos (post-limpieza) | 80% de los encontrados |
| Tiempo por sitio web | 2-5 seg |
| Tiempo total (800 sitios) | 30-45 min |

---

## FASE 4: Exportacion

Los archivos se generan automaticamente al terminar `main.py`, o manualmente:

### Formatos de salida

1. **JSON** (`repuestos_amba_YYYYMMDD.json`):
   - Estructura anidada con metadata
   - Listo para importar en admin panels
   - Cada lead tiene: contacto, ubicacion, online, reputacion

2. **CSV** (`repuestos_amba_YYYYMMDD.csv`):
   - Separador `;` (para Excel en espanol)
   - Encoding UTF-8 BOM
   - Headers en espanol

3. **Excel** (`repuestos_amba_YYYYMMDD.xlsx`):
   - 6 hojas: Base Completa, Por Zona, Con WhatsApp, Con Sitio Web, Top Rating, Zona Prioridad
   - Headers con estilo, colores alternados, filtros automaticos
   - Rating con formato condicional (verde >= 4.0, rojo < 3.0)
   - Columnas de telefono formateadas como texto

4. **Enriched JSON** (`repuestos_amba_enriched.json`):
   - Mismo formato que checkpoint pero con emails agregados

---

## Errores comunes y soluciones

| Error | Causa | Solucion |
|-------|-------|----------|
| `Timeout 30000ms exceeded` en search | `wait_until='networkidle'` | Cambiar a `'domcontentloaded'` |
| `Locator.click: Timeout` en search input | Input no encontrado en headless | Usar navegacion por URL directa |
| `scroll_into_view: Timeout` al volver atras | Locators stale despues de click/back | Recolectar URLs primero, visitar directamente |
| `UnicodeEncodeError: charmap` | Emoji en logs + Windows cp1252 | Usar texto plano sin emoji |
| `ModuleNotFoundError` | python/pip apuntan a versiones distintas | `python -m pip install` |
| CAPTCHA detectado | Demasiadas requests | Esperar 60s, rotar user-agent, --resume |
| `object float can't be used in await` | Funcion sync llamada con await | Hacer la funcion `async def` |

---

## Ejemplo de uso completo

### Para el usuario (adaptando rubro y zona):

```
/google-maps-scraper "ferreterias" "Cordoba Capital"
```

### Lo que el skill debe hacer:

1. Verificar/instalar dependencias
2. Adaptar `config.py`:
   - ZONAS con barrios de Cordoba
   - QUERY_TEMPLATES con "ferreteria en {zona}", "materiales de construccion en {zona}", etc.
   - RELEVANT_CATEGORIES con "ferreteria", "materiales", "construccion"
   - Coordenadas de Cordoba (-31.4201, -64.1888)
3. Ejecutar `python main.py` en background
4. Monitorear progreso cada 2-3 minutos
5. Al terminar, ejecutar `python enrich_leads.py`
6. Limpiar emails falsos
7. Exportar archivos finales
8. Mostrar resumen con stats

---

## Datos extraidos por lead

| Campo | Fuente | Tasa de exito |
|-------|--------|---------------|
| nombre | Google Maps | 100% |
| direccion | Google Maps | 95% |
| telefono | Google Maps | 90-95% |
| sitio_web | Google Maps | 40-50% |
| rating | Google Maps | 85% |
| cantidad_resenas | Google Maps | 85% |
| categoria_google | Google Maps | 80% |
| horarios | Google Maps | 60% |
| google_maps_url | Google Maps | 100% |
| coordenadas | Google Maps URL | 90% |
| email | Sitio web (enricher) | 25-35% de los con web |
| instagram | Sitio web (enricher) | 15-20% de los con web |
| facebook | Sitio web (enricher) | 15-20% de los con web |
| whatsapp | Sitio web (enricher) | 5-10% de los con web |

---

## Arquitectura del codigo

```
main.py          -> Orquesta las 3 fases: scrape -> parse -> export
scraper.py       -> GoogleMapsScraper class (Playwright async)
  - start()      -> Lanza Chromium
  - _new_context() -> Crea contexto con UA/geolocation/cookies
  - search()     -> Navega por URL directa
  - scroll_results() -> Scroll hasta fin de lista
  - _collect_result_urls() -> Recolecta URLs de lugares
  - extract_place_details() -> Extrae datos de ficha de lugar
  - extract_social_from_website() -> Visita web, extrae social/email
  - scrape_query() -> Pipeline completo para una query
  - scrape_zona() -> Itera localidades x templates
  - scrape_all()  -> Itera zonas con checkpoint y STOP signal
parser.py        -> Limpieza de datos
  - normalize_phone() -> Formato argentino canonico
  - clean_address()   -> Expande abreviaciones, title case
  - extract_localidad_from_address() -> Detecta localidad en direccion
  - classify_zona()   -> Asigna zona segun localidad
  - deduplicate()     -> Fuzzy matching nombre+direccion (85% threshold)
  - filter_relevant() -> Filtra por categorias relevantes/excluidas
  - clean_horarios()  -> Parsea horarios de Google a formato legible
  - parse_all()       -> Pipeline completo de limpieza
exporter.py      -> Genera XLSX (6 hojas), CSV, JSON
enrich_leads.py  -> Visita sitios web para extraer emails
utils.py         -> UA rotation, delays, logging, checkpoints, captcha detection
config.py        -> Toda la configuracion (zonas, queries, selectores, delays)
```
