"""
Configuración del scraper de repuestos automotor - AMBA
"""

# Zonas del AMBA organizadas por región
ZONAS = {
    "CABA": [
        "Liniers", "Mataderos", "Villa Luro", "Floresta",
        "Parque Patricios", "Barracas", "La Boca", "Pompeya",
        "Villa Devoto", "Villa del Parque", "Villa Urquiza",
        "Flores", "Caballito", "Almagro", "Boedo",
        "Balvanera", "Once", "San Cristóbal",
        "San Telmo", "Constitución", "Monserrat",
        "Palermo", "Belgrano", "Núñez",
        "Villa Soldati", "Villa Lugano", "Villa Riachuelo"
    ],
    "Zona Oeste": [
        "Ituzaingó", "Morón", "Castelar", "Haedo",
        "Merlo", "Padua", "Paso del Rey",
        "Moreno", "Trujui",
        "Hurlingham", "William Morris",
        "San Antonio de Padua",
        "San Justo", "Ramos Mejía", "Lomas del Mirador",
        "Isidro Casanova", "González Catán", "Laferrere",
        "Ciudad Evita", "Tablada", "Aldo Bonzi",
        "Caseros", "Santos Lugares", "Ciudad Jardín", "El Palomar"
    ],
    "Zona Sur": [
        "Lanús", "Remedios de Escalada", "Valentín Alsina",
        "Avellaneda", "Sarandí", "Wilde", "Dock Sud",
        "Quilmes", "Bernal", "Don Bosco", "Ezpeleta",
        "Berazategui", "Hudson",
        "Florencio Varela",
        "Lomas de Zamora", "Banfield", "Temperley",
        "Adrogué", "Burzaco", "Claypole", "Rafael Calzada",
        "Monte Grande", "El Jagüel",
        "Ezeiza"
    ],
    "Zona Norte": [
        "San Isidro", "Martínez", "Boulogne", "Beccar",
        "Vicente López", "Olivos", "Munro", "Florida",
        "San Fernando", "Victoria",
        "Tigre", "Don Torcuato", "Pacheco",
        "San Martín", "José León Suárez", "Villa Ballester", "San Andrés",
        "San Miguel", "Bella Vista", "Muñiz",
        "José C. Paz", "Del Viso",
        "Pilar",
        "Los Polvorines", "Pablo Nogués", "Grand Bourg",
        "Belén de Escobar", "Garín"
    ]
}

# Mapping localidad -> partido for classification
LOCALIDAD_PARTIDO = {
    # Zona Oeste
    "Ituzaingó": "Ituzaingó", "Morón": "Morón", "Castelar": "Morón", "Haedo": "Morón",
    "Merlo": "Merlo", "Padua": "Merlo", "Paso del Rey": "Merlo", "San Antonio de Padua": "Merlo",
    "Moreno": "Moreno", "Trujui": "Moreno",
    "Hurlingham": "Hurlingham", "William Morris": "Hurlingham",
    "San Justo": "La Matanza", "Ramos Mejía": "La Matanza", "Lomas del Mirador": "La Matanza",
    "Isidro Casanova": "La Matanza", "González Catán": "La Matanza", "Laferrere": "La Matanza",
    "Ciudad Evita": "La Matanza", "Tablada": "La Matanza", "Aldo Bonzi": "La Matanza",
    "Caseros": "Tres de Febrero", "Santos Lugares": "Tres de Febrero",
    "Ciudad Jardín": "Tres de Febrero", "El Palomar": "Tres de Febrero",
    # Zona Sur
    "Lanús": "Lanús", "Remedios de Escalada": "Lanús", "Valentín Alsina": "Lanús",
    "Avellaneda": "Avellaneda", "Sarandí": "Avellaneda", "Wilde": "Avellaneda", "Dock Sud": "Avellaneda",
    "Quilmes": "Quilmes", "Bernal": "Quilmes", "Don Bosco": "Quilmes", "Ezpeleta": "Quilmes",
    "Berazategui": "Berazategui", "Hudson": "Berazategui",
    "Florencio Varela": "Florencio Varela",
    "Lomas de Zamora": "Lomas de Zamora", "Banfield": "Lomas de Zamora", "Temperley": "Lomas de Zamora",
    "Adrogué": "Almirante Brown", "Burzaco": "Almirante Brown", "Claypole": "Almirante Brown", "Rafael Calzada": "Almirante Brown",
    "Monte Grande": "Esteban Echeverría", "El Jagüel": "Esteban Echeverría",
    "Ezeiza": "Ezeiza",
    # Zona Norte
    "San Isidro": "San Isidro", "Martínez": "San Isidro", "Boulogne": "San Isidro", "Beccar": "San Isidro",
    "Vicente López": "Vicente López", "Olivos": "Vicente López", "Munro": "Vicente López", "Florida": "Vicente López",
    "San Fernando": "San Fernando", "Victoria": "San Fernando",
    "Tigre": "Tigre", "Don Torcuato": "Tigre", "Pacheco": "Tigre",
    "San Martín": "General San Martín", "José León Suárez": "General San Martín",
    "Villa Ballester": "General San Martín", "San Andrés": "General San Martín",
    "San Miguel": "San Miguel", "Bella Vista": "San Miguel", "Muñiz": "San Miguel",
    "José C. Paz": "José C. Paz", "Del Viso": "Pilar",
    "Pilar": "Pilar",
    "Los Polvorines": "Malvinas Argentinas", "Pablo Nogués": "Malvinas Argentinas", "Grand Bourg": "Malvinas Argentinas",
    "Belén de Escobar": "Escobar", "Garín": "Escobar",
    # CABA
    "Liniers": "CABA", "Mataderos": "CABA", "Villa Luro": "CABA", "Floresta": "CABA",
    "Parque Patricios": "CABA", "Barracas": "CABA", "La Boca": "CABA", "Pompeya": "CABA",
    "Villa Devoto": "CABA", "Villa del Parque": "CABA", "Villa Urquiza": "CABA",
    "Flores": "CABA", "Caballito": "CABA", "Almagro": "CABA", "Boedo": "CABA",
    "Balvanera": "CABA", "Once": "CABA", "San Cristóbal": "CABA",
    "San Telmo": "CABA", "Constitución": "CABA", "Monserrat": "CABA",
    "Palermo": "CABA", "Belgrano": "CABA", "Núñez": "CABA",
    "Villa Soldati": "CABA", "Villa Lugano": "CABA", "Villa Riachuelo": "CABA",
}

# Search query templates
QUERY_TEMPLATES = [
    "casa de repuestos automotor en {zona}",
    "repuestos de suspensión en {zona}",
    "repuestos de dirección en {zona}",
    "autopartes en {zona}",
    "repuestos automotor mayorista en {zona}",
]

# Proximity order from Ituzaingó (for Zona Oeste priority sorting)
PROXIMIDAD_ITUZAINGO = [
    "Ituzaingó", "Morón", "Castelar", "Haedo", "Hurlingham",
    "El Palomar", "Caseros", "Santos Lugares", "Ciudad Jardín",
    "William Morris", "Ramos Mejía", "San Justo", "Tablada",
    "Aldo Bonzi", "Ciudad Evita", "Lomas del Mirador",
    "San Antonio de Padua", "Padua", "Merlo", "Paso del Rey",
    "Isidro Casanova", "Laferrere", "González Catán",
    "Moreno", "Trujui"
]

# Google Maps CSS selectors (centralized for easy updates)
SELECTORS = {
    "search_input": 'input#searchboxinput',
    "search_button": 'button#searchbox-searchbutton',
    "results_container": 'div[role="feed"]',
    "result_item": 'div[role="feed"] > div > div > a',
    "result_item_alt": 'div.Nv2PK',
    "place_name": 'h1.DUwDvf',
    "place_name_alt": 'div.lMbq3e h1',
    "rating": 'div.F7nice span[aria-hidden="true"]',
    "reviews_count": 'div.F7nice span[aria-label]',
    "category": 'button.DkEaL',
    "address": 'button[data-item-id="address"] div.fontBodyMedium',
    "address_alt": 'div.rogA2c div.Io6YTe',
    "phone": 'button[data-item-id^="phone"] div.fontBodyMedium',
    "phone_alt": 'div.rogA2c a[data-item-id^="phone"]',
    "website": 'a[data-item-id="authority"]',
    "website_alt": 'div.rogA2c a[data-item-id="authority"]',
    "hours": 'div[aria-label*="horario"], div[aria-label*="hours"]',
    "back_button": 'button[aria-label="Atrás"], button[aria-label="Back"]',
    "end_of_list": 'span.HlvSq',
}

# Timing configuration
DELAYS = {
    "between_searches": (3, 8),      # seconds, random uniform
    "between_clicks": (1, 3),
    "page_load": (2, 4),
    "scroll_pause": (0.8, 1.5),
    "captcha_wait": 60,
    "error_retry": 10,
}

MAX_RETRIES = 3
CHECKPOINT_INTERVAL = 50  # Save every N results
MAX_SCROLL_ATTEMPTS = 30  # Max scrolls per results list

# Categories to KEEP (relevant to auto parts)
RELEVANT_CATEGORIES = [
    "repuesto", "autopart", "auto part", "accesorio", "automotor",
    "suspensión", "dirección", "taller", "mecánic", "lubricentro",
    "casa de repuesto", "distribuidor", "mayorista", "minorista",
]

# Categories to EXCLUDE
EXCLUDE_CATEGORIES = [
    "restaurant", "hotel", "farmacia", "supermercado", "escuela",
    "hospital", "banco", "inmobiliaria", "peluquer", "veterinar",
]
