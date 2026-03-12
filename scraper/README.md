# Scraper de Casas de Repuestos Automotor - AMBA

**Santana Hnos. - Herramienta de Generación de Leads**

Scraper automatizado que recopila información de casas de repuestos automotor en el Área Metropolitana de Buenos Aires (AMBA) utilizando Google Maps. Diseñado para generar una base de datos de potenciales clientes para Santana Hnos.

## Datos que recopila

- Nombre del comercio
- Dirección completa
- Teléfono fijo y celular/WhatsApp
- Email
- Sitio web
- Redes sociales (Instagram, Facebook)
- Horarios de atención
- Calificación y cantidad de reseñas en Google Maps
- Zona geográfica (Zona Norte, Sur, Oeste, CABA, etc.)

---

## Instalación

### 1. Clonar o descargar el proyecto

```bash
cd santanahnos/scraper
```

### 2. Crear un entorno virtual (recomendado)

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Instalar el navegador para Playwright

```bash
playwright install chromium
```

---

## Uso

### Scrapear todas las zonas del AMBA

```bash
python main.py
```

Ejecuta el scraper completo sobre todas las zonas configuradas (Zona Norte, Zona Sur, Zona Oeste, CABA, etc.). Dependiendo de la cantidad de localidades, puede demorar entre 30 minutos y 2 horas.

### Scrapear una sola zona

```bash
python main.py --zona "Zona Oeste"
```

Útil para hacer pruebas o si solo se necesitan datos de una zona específica. Las zonas disponibles están definidas en `config.py`.

### Continuar desde el último checkpoint

```bash
python main.py --resume
```

Si el scraper fue interrumpido (por error de red, cierre accidental, etc.), este flag permite retomar desde donde se quedó. El progreso se guarda automáticamente en archivos de checkpoint dentro de `data/`.

### Ejecutar con navegador visible (debug)

```bash
python main.py --no-headless
```

Abre una ventana del navegador Chromium visible para poder observar el proceso de scraping en tiempo real. Útil para depuración y para verificar que el scraper navega correctamente.

### Combinar opciones

```bash
python main.py --zona "CABA" --no-headless
python main.py --zona "Zona Norte" --resume
python main.py --output data/mi_carpeta
```

---

## Archivos de salida

Los resultados se guardan en `data/output/` (o el directorio especificado con `--output`):

| Archivo | Descripción |
|---------|-------------|
| `repuestos_amba_YYYYMMDD.xlsx` | Planilla Excel con todos los datos, formateada y lista para usar |
| `repuestos_amba_YYYYMMDD.csv` | Archivo CSV para importar en otros sistemas |
| `repuestos_amba_YYYYMMDD.json` | Datos en formato JSON para integración con APIs |

Además, los logs de cada ejecución se guardan en `data/logs/`.

---

## Estructura del proyecto

```
scraper/
├── main.py              # Orquestador principal
├── config.py            # Configuración de zonas, queries y parámetros
├── scraper.py           # Lógica de scraping con Playwright
├── parser.py            # Limpieza, normalización y deduplicación de datos
├── exporter.py          # Exportación a Excel, CSV y JSON
├── utils.py             # Utilidades (logger, helpers)
├── requirements.txt     # Dependencias de Python
├── README.md            # Este archivo
└── data/
    ├── output/          # Archivos de salida generados
    ├── logs/            # Logs de ejecución
    └── checkpoints/     # Puntos de guardado para --resume
```

---

## Medidas anti-bloqueo

El scraper implementa varias técnicas para evitar ser detectado y bloqueado por Google:

- **Delays aleatorios**: Entre cada acción se espera un tiempo variable (no fijo) para simular comportamiento humano.
- **Scroll gradual**: El listado de resultados se recorre con scrolls progresivos, imitando la navegación manual.
- **User-Agent rotativo**: Se utilizan diferentes cadenas de User-Agent para cada sesión.
- **Pausas entre zonas**: Se introduce una espera más larga entre el scraping de diferentes zonas.
- **Reintentos con backoff**: Si una solicitud falla, se reintenta con tiempos de espera crecientes.
- **Checkpoints automáticos**: El progreso se guarda periódicamente para no perder datos en caso de interrupción.
- **Límite de velocidad**: Se respeta un rate limit configurable para no saturar el servicio.

Estos parámetros son ajustables desde `config.py`.

---

## Aviso legal

Esta herramienta recopila exclusivamente **información pública** disponible en Google Maps, tal como nombres de comercios, direcciones, teléfonos y horarios que los propios negocios publican de forma abierta.

- Los datos recopilados son de acceso público y están disponibles para cualquier usuario de Google Maps.
- El uso de esta herramienta es con fines comerciales legítimos de prospección de clientes (B2B).
- No se accede a información privada, protegida por contraseña ni datos personales sensibles.
- Se recomienda cumplir con los Términos de Servicio de Google y con la legislación vigente en materia de protección de datos personales (Ley 25.326 de Protección de Datos Personales de Argentina).
- El usuario de esta herramienta es responsable del uso que haga de los datos obtenidos.
- Se recomienda no ejecutar el scraper de forma excesivamente frecuente ni agresiva para no afectar el servicio de Google Maps.

**Santana Hnos. no se hace responsable del uso indebido de esta herramienta por parte de terceros.**
