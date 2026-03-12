#!/usr/bin/env python3
"""
Scraper de casas de repuestos automotor - AMBA
Santana Hnos. - Lead Generation Tool
"""

import asyncio
import argparse
import time
import os
import sys
from datetime import datetime

from config import ZONAS
from scraper import GoogleMapsScraper
from parser import parse_all
from exporter import export_all
from utils import setup_logger

def parse_args():
    parser = argparse.ArgumentParser(description='Scraper de repuestos automotor AMBA')
    parser.add_argument('--zona', type=str, help='Scrapear solo una zona (ej: "Zona Oeste")')
    parser.add_argument('--resume', action='store_true', help='Continuar desde el último checkpoint')
    parser.add_argument('--headless', action='store_true', default=True, help='Ejecutar sin ventana del browser')
    parser.add_argument('--no-headless', action='store_true', help='Ejecutar con ventana visible (debug)')
    parser.add_argument('--output', type=str, default='data/output', help='Directorio de salida')
    return parser.parse_args()

async def main():
    args = parse_args()
    headless = not args.no_headless

    # Ensure directories exist
    os.makedirs('data/output', exist_ok=True)
    os.makedirs('data/logs', exist_ok=True)

    logger = setup_logger('main', 'data/logs')

    start_time = time.time()
    logger.info("=" * 60)
    logger.info("SCRAPER DE REPUESTOS AUTOMOTOR - AMBA")
    logger.info("Santana Hnos. - Lead Generation")
    logger.info("=" * 60)

    # Determine which zones to scrape
    zonas = None
    if args.zona:
        if args.zona in ZONAS:
            zonas = [args.zona]
            logger.info(f"Zona seleccionada: {args.zona}")
        else:
            logger.error(f"Zona '{args.zona}' no encontrada. Zonas disponibles: {list(ZONAS.keys())}")
            sys.exit(1)
    else:
        zonas = list(ZONAS.keys())
        logger.info(f"Scrapeando todas las zonas: {zonas}")

    # Phase 1: Scraping
    logger.info("\n>> FASE 1: Scraping de Google Maps...")
    scraper = GoogleMapsScraper(headless=headless, log_dir='data/logs')

    try:
        raw_results = await scraper.scrape_all(zonas=zonas, resume=args.resume)
    except KeyboardInterrupt:
        logger.info("\n[!] Scraping interrumpido por el usuario. Guardando progreso...")
        raw_results = scraper.results
    except Exception as e:
        logger.error(f"Error durante scraping: {e}")
        raw_results = scraper.results

    logger.info(f"\n>> Resultados brutos: {len(raw_results)}")

    if not raw_results:
        logger.warning("No se encontraron resultados. Saliendo.")
        return

    # Phase 2: Parsing & Cleaning
    logger.info("\n>> FASE 2: Limpieza y deduplicacion...")
    clean_results = parse_all(raw_results)
    logger.info(f"Resultados después de limpieza: {len(clean_results)}")

    # Phase 3: Export
    logger.info("\n>> FASE 3: Exportando datos...")
    files = export_all(clean_results, args.output)

    # Summary
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)

    # Count stats
    with_phone = sum(1 for r in clean_results if r.get('telefono'))
    with_whatsapp = sum(1 for r in clean_results if r.get('celular_whatsapp'))
    with_email = sum(1 for r in clean_results if r.get('email'))
    with_web = sum(1 for r in clean_results if r.get('sitio_web'))
    with_social = sum(1 for r in clean_results if r.get('instagram') or r.get('facebook'))

    by_zona = {}
    for r in clean_results:
        z = r.get('zona', 'Sin zona')
        by_zona[z] = by_zona.get(z, 0) + 1

    logger.info("\n" + "=" * 60)
    logger.info("RESUMEN FINAL")
    logger.info("=" * 60)
    logger.info(f"Total comercios encontrados: {len(clean_results)}")
    logger.info(f"\nDesglose por zona:")
    for zona, count in sorted(by_zona.items(), key=lambda x: -x[1]):
        logger.info(f"  {zona}: {count}")
    logger.info(f"\nDatos de contacto:")
    logger.info(f"  Con teléfono:  {with_phone}")
    logger.info(f"  Con WhatsApp:  {with_whatsapp}")
    logger.info(f"  Con email:     {with_email}")
    logger.info(f"  Con sitio web: {with_web}")
    logger.info(f"  Con redes:     {with_social}")
    logger.info(f"\nTiempo total: {minutes}m {seconds}s")
    logger.info(f"\nArchivos generados:")
    for f in files:
        logger.info(f"  -> {f}")
    logger.info("=" * 60)

if __name__ == '__main__':
    asyncio.run(main())
