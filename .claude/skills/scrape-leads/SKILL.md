---
name: scrape-leads
description: Scraper de Google Maps para generar leads de casas de repuestos automotor en AMBA. Ejecuta el scraper, muestra progreso, y al terminar importa los resultados al panel admin (Nuevos Clientes). Usar cuando el usuario quiera buscar nuevos clientes potenciales.
disable-model-invocation: true
argument-hint: [zona|todas] [--headless] [--resume]
allowed-tools: Bash, Read, Grep, Glob, TaskOutput, TaskStop
---

# Scraper de Leads - Santana Hnos.

Ejecutar el scraper de Google Maps para generar leads de casas de repuestos automotor en el AMBA.

## Argumentos

- `$0` = Zona a scrapear. Opciones: `"Zona Oeste"`, `"Zona Sur"`, `"Zona Norte"`, `"CABA"`, `todas`. Default: `"Zona Oeste"`
- Si se incluye `--headless`: ejecutar sin ventana visible
- Si se incluye `--resume`: continuar desde el ultimo checkpoint

## Instrucciones

1. **Validar entorno**: Verificar que existen las dependencias (playwright, pandas, openpyxl, beautifulsoup4). Si no estan instaladas, instalarlas con `python -m pip install playwright pandas openpyxl beautifulsoup4` y luego `playwright install chromium`.

2. **Preparar comando**: Ir al directorio del scraper y construir el comando:
   ```
   cd scraper
   python main.py [opciones]
   ```

   Mapear argumentos:
   - Si `$0` es "todas" o no se especifica zona: no pasar `--zona`
   - Si `$0` es una zona especifica: pasar `--zona "$0"`
   - Si se pidio headless: agregar `--headless`
   - Si se pidio resume: agregar `--resume`
   - Si NO se pidio headless: agregar `--no-headless` (para que el usuario vea el navegador)

3. **Ejecutar en background**: Lanzar el scraper con `run_in_background: true` y timeout largo (600000ms).

4. **Monitorear progreso**: Cada 2-3 minutos, usar TaskOutput con `block: false` para verificar el estado y reportar al usuario cuantos resultados lleva.

5. **Al terminar**:
   - Mostrar el resumen final (total encontrados, desglose por zona, datos de contacto)
   - Verificar que se generaron los archivos en `scraper/data/output/`
   - Informar al usuario que puede importar el JSON desde el panel admin: **Nuevos Clientes > Importar JSON**
   - Indicar la ruta exacta del archivo JSON generado

6. **Si hay errores**:
   - Si falla por timeout de Google Maps: sugerir `--no-headless` para debug
   - Si hay CAPTCHA: informar al usuario que Google detecto actividad automatizada, esperar e intentar con `--resume`
   - Si falla por dependencias: instalarlas automaticamente

## Zonas disponibles

| Zona | Localidades | Queries estimadas |
|------|------------|-------------------|
| Zona Oeste | 25 (Ituzaingo, Moron, Castelar, Haedo, Merlo...) | 125 |
| Zona Sur | 25 (Lanus, Avellaneda, Quilmes, Lomas de Zamora...) | 125 |
| Zona Norte | 28 (San Isidro, Tigre, Vicente Lopez, San Fernando...) | 140 |
| CABA | 27 (Liniers, Mataderos, Flores, Caballito...) | 135 |
| **Todas** | **105** | **525** |

## Archivos generados

Los resultados se guardan en `scraper/data/output/`:
- `repuestos_amba_YYYYMMDD.xlsx` - Excel con 6 hojas
- `repuestos_amba_YYYYMMDD.csv` - CSV con separador ;
- `repuestos_amba_YYYYMMDD.json` - JSON para importar en admin

## Ejemplo de uso

```
/scrape-leads "Zona Oeste"
/scrape-leads todas --headless
/scrape-leads "Zona Sur" --resume
/scrape-leads
```
