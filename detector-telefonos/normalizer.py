"""
Normalizador de numeros de telefono argentinos.
Interpreta todos los formatos comunes usados en Argentina y normaliza
a formato local e internacional estandar.
"""

import re
from typing import Tuple, Optional


# Codigos de area conocidos de 3 y 4 digitos (los de 2 digitos son solo 11)
AREA_CODES_3 = {
    '220', '221', '223', '230', '236', '237', '249', '260', '261', '263',
    '264', '266', '280', '291', '294', '297', '298', '299',
    '341', '342', '343', '345', '348', '351', '353', '358',
    '362', '364', '370', '376', '379', '380', '381', '383', '385', '387', '388',
}

AREA_CODES_4 = {
    '2202', '2221', '2223', '2224', '2225', '2226', '2227', '2229',
    '2241', '2242', '2243', '2244', '2245', '2246', '2252', '2254', '2255',
    '2261', '2262', '2264', '2265', '2266', '2267', '2268', '2271', '2272',
    '2274', '2281', '2283', '2284', '2285', '2286', '2291', '2292', '2296', '2297',
    '2302', '2314', '2316', '2317', '2320', '2323', '2324', '2325', '2326',
    '2331', '2333', '2334', '2335', '2336', '2337', '2338', '2342', '2343',
    '2344', '2345', '2346', '2352', '2353', '2354', '2355', '2356', '2357',
    '2358', '2362', '2364', '2365', '2392', '2393', '2394', '2395', '2396',
    '3327', '3329', '3382', '3385', '3387', '3388', '3400', '3401', '3402',
    '3404', '3405', '3406', '3407', '3408', '3409',
    '3435', '3436', '3437', '3438', '3442', '3444', '3445', '3446', '3447',
    '3454', '3455', '3456', '3458', '3460', '3462', '3463', '3464', '3465',
    '3466', '3467', '3468', '3469', '3471', '3472', '3476', '3482', '3483',
    '3487', '3489', '3491', '3492', '3493', '3496', '3497', '3498',
}

# Prefijos de texto que limpiar
TEXT_PREFIXES_RE = re.compile(
    r'^(?:tel\.?|telefono|celular|cel\.?|fax\.?|whatsapp|wsp|wa|fono|phone|mob)[\s.:/-]*',
    re.IGNORECASE,
)

# Regex para detectar multiples telefonos en un campo
MULTI_PHONE_RE = re.compile(r'\s*[/\\|]\s*|\s+[yYoO]\s+|\s*;\s*')


def split_multiple_phones(raw: str) -> list:
    """Si un campo tiene multiples telefonos separados por / o 'y', los separa."""
    parts = MULTI_PHONE_RE.split(raw.strip())
    return [p.strip() for p in parts if p.strip() and len(re.sub(r'\D', '', p)) >= 6]


def clean_raw(raw: str) -> str:
    """Limpia texto de prefijos y caracteres no relevantes."""
    s = raw.strip()
    s = TEXT_PREFIXES_RE.sub('', s).strip()
    # Remover parentesis pero conservar contenido
    s = s.replace('(', '').replace(')', '')
    return s


def extract_digits(s: str) -> Tuple[str, bool]:
    """Extrae solo digitos y detecta si empieza con +."""
    has_plus = s.lstrip().startswith('+')
    digits = re.sub(r'\D', '', s)
    return digits, has_plus


def detect_area_code(digits: str) -> Tuple[Optional[str], str]:
    """
    Detecta el codigo de area y retorna (area_code, subscriber_number).
    El numero de entrada NO debe tener prefijo de pais (54) ni 0 trunk ni 9 mobile.
    Debe ser area + subscriber (10 digitos totales para Argentina).
    """
    # Area code 11 (2 digitos) -> subscriber 8 digitos
    if digits.startswith('11') and len(digits) == 10:
        return '11', digits[2:]

    # Area code 4 digitos -> subscriber 6 digitos
    if len(digits) == 10:
        four = digits[:4]
        if four in AREA_CODES_4:
            return four, digits[4:]

    # Area code 3 digitos -> subscriber 7 digitos
    if len(digits) == 10:
        three = digits[:3]
        if three in AREA_CODES_3:
            return three, digits[3:]

    # Fallback: intentar 2 digitos
    if len(digits) == 10:
        return digits[:2], digits[2:]

    return None, digits


def normalize(raw: str, default_area: str = '11') -> dict:
    """
    Normaliza un numero de telefono argentino.

    Retorna un dict con:
      - original: texto original
      - normalizado_local: formato local legible
      - normalizado_internacional: formato +54
      - tipo: 'celular' | 'fijo' | 'no_clasificado'
      - confianza: 'alta' | 'media' | 'baja'
      - codigo_area: str
      - es_celular: bool
      - whatsapp_probable: bool
      - link_whatsapp: str | None
      - notas: str
    """
    result = {
        'original': raw,
        'normalizado_local': '',
        'normalizado_internacional': '',
        'tipo': 'no_clasificado',
        'confianza': 'baja',
        'codigo_area': '',
        'es_celular': False,
        'whatsapp_probable': False,
        'link_whatsapp': None,
        'notas': '',
    }

    cleaned = clean_raw(raw)
    digits, has_plus = extract_digits(cleaned)

    if not digits or len(digits) < 6:
        result['notas'] = 'Numero muy corto o vacio'
        return result

    if len(digits) > 15:
        result['notas'] = 'Numero demasiado largo'
        return result

    # --- Fase 1: Remover prefijo de pais ---
    had_country_code = False
    if has_plus and digits.startswith('54'):
        digits = digits[2:]
        had_country_code = True
    elif digits.startswith('0054'):
        digits = digits[4:]
        had_country_code = True
    elif not has_plus and digits.startswith('54') and len(digits) > 12:
        digits = digits[2:]
        had_country_code = True

    # --- Fase 2: Detectar y remover 9 (indicador mobile internacional) ---
    had_nine = False
    if digits.startswith('9') and len(digits) == 11:
        digits = digits[1:]
        had_nine = True

    # --- Fase 3: Remover trunk prefix 0 ---
    had_trunk = False
    if digits.startswith('0'):
        digits = digits[1:]
        had_trunk = True

    # --- Fase 4: Detectar 15 (indicador mobile local) ---
    has_fifteen = False

    # Caso especial: 15 duplicado (ej: 11 15 15 3456 7890 = 14 digitos sin trunk)
    # Despues de quitar trunk: 1115153456789​0 = 13 digitos
    if len(digits) == 14 and digits[2:4] == '15' and digits[4:6] == '15':
        has_fifteen = True
        digits = digits[:2] + digits[6:]
        result['notas'] = '15 duplicado removido'
    elif len(digits) == 13 and digits[2:4] == '15' and digits[4:6] == '15':
        has_fifteen = True
        digits = digits[:2] + digits[6:]
        result['notas'] = '15 duplicado removido'

    # Caso: area(2) + 15 + 8 digitos = 12 digitos (ej: 11 15 3456 7890)
    if not has_fifteen and len(digits) == 12 and digits[2:4] == '15':
        has_fifteen = True
        digits = digits[:2] + digits[4:]  # Remover el 15

    # Caso: 15 + 8 digitos = 10 digitos, sin area explicito
    elif digits.startswith('15') and len(digits) == 10:
        has_fifteen = True
        digits = default_area + digits[2:]  # Agregar area por defecto

    # Caso: solo 15 + 8 digitos sin area y el 15 se uso como marcador
    elif digits.startswith('15') and len(digits) == 10:
        has_fifteen = True
        digits = default_area + digits[2:]

    # Caso: area(3) + 15 + 7 digitos = 12 digitos
    elif len(digits) == 12:
        potential_area_3 = digits[:3]
        if potential_area_3 in AREA_CODES_3 and digits[3:5] == '15':
            has_fifteen = True
            digits = digits[:3] + digits[5:]

    # Caso: area(4) + 15 + 6 digitos = 12 digitos
    elif len(digits) == 12:
        potential_area_4 = digits[:4]
        if potential_area_4 in AREA_CODES_4 and digits[4:6] == '15':
            has_fifteen = True
            digits = digits[:4] + digits[6:]

    # Caso: 15 al inicio sin area, 8 digitos despues
    if digits.startswith('15') and len(digits) == 10 and not has_fifteen:
        has_fifteen = True
        digits = default_area + digits[2:]

    # --- Fase 5: Numero sin codigo de area (8 digitos solos) ---
    assumed_area = False
    if len(digits) == 8:
        digits = default_area + digits
        assumed_area = True

    # --- Fase 6: Detectar 15 duplicado ---
    # A veces aparece 11 15 15 XXXX-XXXX
    if len(digits) == 12 and digits[2:4] == '15':
        has_fifteen = True
        digits = digits[:2] + digits[4:]
        result['notas'] = '15 duplicado removido'

    # --- Fase 7: Validar longitud final ---
    if len(digits) != 10:
        result['notas'] += f' Longitud inesperada: {len(digits)} digitos'
        result['normalizado_local'] = digits
        result['normalizado_internacional'] = '+54 ' + digits
        return result

    # --- Fase 8: Detectar area y clasificar ---
    area_code, subscriber = detect_area_code(digits)
    if not area_code:
        result['notas'] = 'No se pudo detectar codigo de area'
        return result

    result['codigo_area'] = area_code
    is_mobile = has_fifteen or had_nine

    # Para area 11 (AMBA): solo 4XXX-XXXX son fijos confiables.
    # Todos los demas rangos (2,3,5,6,7,8) son celulares — Google Maps
    # da los numeros sin el prefijo 15.
    if not is_mobile and area_code == '11' and subscriber:
        first_digit = subscriber[0]
        if first_digit != '4':
            is_mobile = True

    result['es_celular'] = is_mobile
    result['tipo'] = 'celular' if is_mobile else 'fijo'

    # --- Fase 9: Formatear ---
    if len(area_code) == 2:
        sub_fmt = f'{subscriber[:4]}-{subscriber[4:]}' if len(subscriber) == 8 else subscriber
    elif len(area_code) == 3:
        sub_fmt = f'{subscriber[:3]}-{subscriber[3:]}' if len(subscriber) == 7 else subscriber
    elif len(area_code) == 4:
        sub_fmt = f'{subscriber[:2]}-{subscriber[2:]}' if len(subscriber) == 6 else subscriber
    else:
        sub_fmt = subscriber

    if is_mobile:
        result['normalizado_local'] = f'0{area_code} 15 {sub_fmt}'
        result['normalizado_internacional'] = f'+54 9 {area_code} {sub_fmt}'
        wa_number = f'549{area_code}{subscriber}'
        result['whatsapp_probable'] = True
        result['link_whatsapp'] = f'https://wa.me/{wa_number}'
    else:
        result['normalizado_local'] = f'0{area_code} {sub_fmt}'
        result['normalizado_internacional'] = f'+54 {area_code} {sub_fmt}'
        result['whatsapp_probable'] = False

    # --- Fase 10: Confianza ---
    if had_country_code or had_nine or (has_fifteen and (had_trunk or had_country_code)):
        result['confianza'] = 'alta'
    elif has_fifteen or had_trunk:
        result['confianza'] = 'alta'
    elif assumed_area:
        result['confianza'] = 'media'
    else:
        result['confianza'] = 'media' if not is_mobile else 'alta'

    if assumed_area:
        note = f'Codigo de area {default_area} asumido'
        result['notas'] = (result['notas'] + '; ' + note).strip('; ') if result['notas'] else note

    return result
