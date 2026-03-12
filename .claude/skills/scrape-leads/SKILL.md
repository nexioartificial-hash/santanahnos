---
name: scrape-leads
description: >
  Atajo para ejecutar el scraper de Google Maps ya configurado para Santana Hnos.
  Usa el mismo motor que /google-maps-scraper pero con la config de repuestos automotor AMBA.
disable-model-invocation: true
argument-hint: [zona|todas] [--headless] [--resume] [--enrich]
allowed-tools: Bash, Read, Grep, Glob, TaskOutput, TaskStop
---

# Scraper de Leads - Santana Hnos.

Ejecutar el scraper de Google Maps ya configurado para repuestos automotor en AMBA.
Para crear un scraper nuevo para otro rubro/zona, usar `/google-maps-scraper`.

## Argumentos

- `$0` = Zona a scrapear. Opciones: `"Zona Oeste"`, `"Zona Sur"`, `"Zona Norte"`, `"CABA"`, `todas`. Default: `todas`
- `--headless`: ejecutar sin ventana visible (default)
- `--no-headless`: con ventana visible (debug)
- `--resume`: continuar desde el ultimo checkpoint
- `--enrich`: despues del scraping, ejecutar el enricher de emails

## Instrucciones

1. **Validar entorno**: Verificar dependencias con `python -c "import playwright; import pandas"`. Si faltan: `python -m pip install playwright pandas openpyxl beautifulsoup4 && playwright install chromium`.

2. **Ejecutar scraper en background**:
   ```bash
   cd scraper
   python main.py [--zona "Zona X"] [--headless] [--resume]
   ```
   Lanzar con `run_in_background: true` y timeout 600000ms.

3. **Monitorear progreso**: Cada 2-3 minutos, usar TaskOutput con `block: false`.

4. **Al terminar el scraping**:
   - Si se pidio `--enrich`: ejecutar `python enrich_leads.py` en background
   - Limpiar emails falsos (sentry, wixpress, ejemplo, etc.)
   - Mostrar resumen final

5. **Exportar**: Los archivos se generan en `scraper/data/output/`

6. **Detener entre zonas**: Crear `scraper/data/STOP` para frenar despues de la zona actual.

## Zonas disponibles

| Zona | Localidades | Queries |
|------|------------|---------|
| Zona Oeste | 25 | 125 |
| Zona Sur | 24 | 120 |
| Zona Norte | 28 | 140 |
| CABA | 27 | 135 |
| **Todas** | **104** | **520** |

## Archivos generados

- `scraper/data/output/repuestos_amba_YYYYMMDD.xlsx` - Excel con 6 hojas
- `scraper/data/output/repuestos_amba_YYYYMMDD.csv` - CSV separador ;
- `scraper/data/output/repuestos_amba_YYYYMMDD.json` - JSON estructurado
- `scraper/data/output/repuestos_amba_enriched.json` - JSON con emails
- `scraper/data/checkpoint.json` - Checkpoint (para --resume)
