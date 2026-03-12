"""
Limpieza de datos y deduplicación para el scraper de repuestos - Santana Hnos.

Funciones de normalización de teléfonos, direcciones, horarios,
clasificación por zona/partido, y deduplicación por fuzzy matching.
"""

import re
import difflib
from typing import List, Dict, Any, Optional

from config import (
    ZONAS,
    LOCALIDAD_PARTIDO,
    PROXIMIDAD_ITUZAINGO,
    RELEVANT_CATEGORIES,
    EXCLUDE_CATEGORIES,
)


# ---------------------------------------------------------------------------
# Phone normalization
# ---------------------------------------------------------------------------

_NON_DIGIT_EXCEPT_PLUS = re.compile(r"[^\d+]")


def normalize_phone(phone_str: str) -> str:
    """
    Normalize an Argentine phone string to a canonical format.

    Returns:
        "+54 11 XXXX-XXXX"   for landlines
        "+54 9 11 XXXX-XXXX" for mobile
        Original cleaned string if unparseable.
    """
    if not phone_str or not phone_str.strip():
        return ""

    raw = phone_str.strip()
    has_plus = raw.startswith("+")

    # Strip everything except digits and leading +
    digits = re.sub(r"\D", "", raw)
    if not digits:
        return raw.strip()

    # --- Remove country code ---
    if has_plus and digits.startswith("54"):
        digits = digits[2:]
    elif digits.startswith("0054"):
        digits = digits[4:]
    elif not has_plus and digits.startswith("54") and len(digits) > 10:
        digits = digits[2:]

    # Track if there was a '9' mobile indicator in international format
    mobile_international = False
    if digits.startswith("9") and len(digits) == 11:
        mobile_international = True
        digits = digits[1:]  # strip the 9

    # --- Remove trunk prefix 0 (011 -> 11) ---
    if digits.startswith("0"):
        digits = digits[1:]

    # --- Detect and remove '15' mobile prefix ---
    mobile_detected = mobile_international

    # Pattern: 15XXXXXXXX (10 digits, starts with 15, no area code)
    if digits.startswith("15") and len(digits) == 10:
        mobile_detected = True
        digits = "11" + digits[2:]  # assume area code 11

    # Pattern: 11 15 XXXX XXXX (12 digits)
    if digits.startswith("11") and len(digits) == 12 and digits[2:4] == "15":
        mobile_detected = True
        digits = digits[:2] + digits[4:]

    # Pattern: 15 XXXX XXXX (8 digits with 15 prefix -> actually 10)
    if digits.startswith("15") and len(digits) == 8:
        # This is ambiguous, but commonly means mobile without area code
        mobile_detected = True
        digits = "11" + digits[2:]  # assume area code 11, but only 6 subscriber digits
        # Actually 15-XXXX-XXXX means 8 total from the raw "15" prefix
        # Re-parse: the local number is digits minus the 15 prefix
        # This case: "15 XXXX XXXX" = 10 chars raw -> handled above
        # "15-XXXX-XXXX" raw may strip to "15XXXXXXXX" = 10 digits -> handled above
        # If only 8 digits starting with 15, it's ambiguous; treat as local mobile
        pass

    # --- Check for mobile by examining raw string ---
    if not mobile_detected:
        # Check raw input for mobile indicators
        raw_lower = raw.lower()
        if "+54 9 " in raw or "+549" in raw:
            mobile_detected = True
        elif re.search(r"\b15[\s\-]?\d{4}[\s\-]?\d{4}", raw):
            mobile_detected = True

    # --- 8-digit local number (no area code) ---
    if len(digits) == 8:
        first = digits[:4]
        second = digits[4:]
        if mobile_detected:
            return f"+54 9 11 {first}-{second}"
        return f"{first}-{second}"

    # --- 10-digit number (area code + subscriber) ---
    if len(digits) == 10:
        area = digits[:2]
        first = digits[2:6]
        second = digits[6:10]
        if mobile_detected:
            return f"+54 9 {area} {first}-{second}"
        return f"+54 {area} {first}-{second}"

    # --- Fallback ---
    if len(digits) > 6:
        return f"+54 {digits}"
    return digits


# ---------------------------------------------------------------------------
# Mobile detection
# ---------------------------------------------------------------------------

def detect_celular(phone_str: str) -> bool:
    """
    Return True if the phone string looks like an Argentine mobile number.

    Heuristics:
      - Contains '15' mobile prefix
      - Has '9' after country code (+54 9 ...)
      - Subscriber number starts with digits typical of mobiles
    """
    if not phone_str or not phone_str.strip():
        return False

    raw = phone_str.strip()

    # International mobile format
    if "+54 9 " in raw or "+549" in raw:
        return True

    digits = re.sub(r"\D", "", raw)

    # Remove country code
    if digits.startswith("54") and len(digits) > 10:
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]

    # 9 prefix (international mobile)
    if digits.startswith("9") and len(digits) == 11:
        return True

    # 15 at the start (local mobile without area code)
    if digits.startswith("15") and len(digits) in (8, 10):
        return True

    # area code + 15 + subscriber
    if digits.startswith("11") and len(digits) >= 10:
        subscriber = digits[2:]
        if subscriber.startswith("15"):
            return True

    return False


# ---------------------------------------------------------------------------
# Address cleaning
# ---------------------------------------------------------------------------

_ADDRESS_ABBREVIATIONS = {
    r"\bAv\.?\b": "Avenida",
    r"\bCnel\.?\b": "Coronel",
    r"\bGral\.?\b": "General",
    r"\bGrl\.?\b": "General",
    r"\bDr\.?\b": "Doctor",
    r"\bSta\.?\b": "Santa",
    r"\bSto\.?\b": "Santo",
    r"\bBrig\.?\b": "Brigadier",
    r"\bCmte\.?\b": "Comandante",
    r"\bCdte\.?\b": "Comandante",
    r"\bTte\.?\b": "Teniente",
    r"\bSgte\.?\b": "Sargento",
    r"\bPte\.?\b": "Presidente",
    r"\bPje\.?\b": "Pasaje",
    r"\bBvd\.?\b": "Boulevard",
    r"\bBlvd\.?\b": "Boulevard",
    r"\bInt\.?\b": "Intendente",
    r"\bGob\.?\b": "Gobernador",
    r"\bProv\.?\b": "Provincia",
    r"\bBs\.?\s*As\.?\b": "Buenos Aires",
    r"\bN[°º]?\b": "N\u00b0",
}


def clean_address(address_str: str) -> str:
    """
    Clean and normalize an address string.

    - Title case
    - Expand common abbreviations
    - Strip trailing commas, extra whitespace
    """
    if not address_str or not address_str.strip():
        return ""

    text = address_str.strip()

    # Remove trailing commas and dots
    text = re.sub(r"[,.\s]+$", "", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Title case
    text = text.title()

    # Expand abbreviations (case-insensitive replacement, preserving title case)
    for pattern, replacement in _ADDRESS_ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Clean up double spaces that may have been introduced
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ---------------------------------------------------------------------------
# Localidad extraction
# ---------------------------------------------------------------------------

def extract_localidad_from_address(
    address_str: str,
    known_localidades: Optional[List[str]] = None,
) -> str:
    """
    Try to find a known localidad name within the address string.

    Returns the matched localidad name, or empty string if nothing found.
    """
    if not address_str:
        return ""

    if known_localidades is None:
        # Build list from config
        known_localidades = list(LOCALIDAD_PARTIDO.keys())

    address_lower = address_str.lower().strip()

    # Sort by length descending so longer names match first
    # e.g., "San Antonio de Padua" before "Padua"
    sorted_localidades = sorted(known_localidades, key=len, reverse=True)

    for loc in sorted_localidades:
        # Word boundary matching (case insensitive)
        pattern = re.compile(r"\b" + re.escape(loc) + r"\b", re.IGNORECASE)
        if pattern.search(address_lower):
            return loc

    return ""


# ---------------------------------------------------------------------------
# Zona classification
# ---------------------------------------------------------------------------

def classify_zona(
    localidad: str,
    zona_mapping: Optional[Dict[str, List[str]]] = None,
) -> str:
    """
    Given a localidad, return the zona (CABA, Zona Oeste, Zona Sur, Zona Norte).

    Uses ZONAS from config if no mapping provided.
    """
    if not localidad:
        return ""

    if zona_mapping is None:
        zona_mapping = ZONAS

    localidad_clean = localidad.strip()

    for zona, localidades in zona_mapping.items():
        if localidad_clean in localidades:
            return zona

    # Try case-insensitive match
    localidad_lower = localidad_clean.lower()
    for zona, localidades in zona_mapping.items():
        for loc in localidades:
            if loc.lower() == localidad_lower:
                return zona

    return ""


# ---------------------------------------------------------------------------
# Partido lookup
# ---------------------------------------------------------------------------

def get_partido(
    localidad: str,
    partido_mapping: Optional[Dict[str, str]] = None,
) -> str:
    """Return the partido for a given localidad."""
    if not localidad:
        return ""

    if partido_mapping is None:
        partido_mapping = LOCALIDAD_PARTIDO

    localidad_clean = localidad.strip()

    # Direct match
    if localidad_clean in partido_mapping:
        return partido_mapping[localidad_clean]

    # Case-insensitive fallback
    localidad_lower = localidad_clean.lower()
    for loc, partido in partido_mapping.items():
        if loc.lower() == localidad_lower:
            return partido

    return ""


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def _record_signature(record: Dict[str, Any]) -> str:
    """Build a comparable string from name + address for fuzzy matching."""
    name = (record.get("nombre") or "").strip().lower()
    address = (record.get("direccion") or "").strip().lower()
    return f"{name}|{address}"


def _record_completeness(record: Dict[str, Any]) -> int:
    """Count how many non-empty fields a record has."""
    count = 0
    for value in record.values():
        if value is not None and str(value).strip():
            count += 1
    return count


def deduplicate(
    records: List[Dict[str, Any]],
    threshold: int = 85,
) -> List[Dict[str, Any]]:
    """
    Remove duplicate records using fuzzy matching on name+address.

    When duplicates are found, keeps the record with more data filled in.
    threshold: minimum similarity ratio (0-100) to consider a duplicate.
    """
    if not records:
        return []

    threshold_ratio = threshold / 100.0
    result: List[Dict[str, Any]] = []
    signatures: List[str] = []

    for record in records:
        sig = _record_signature(record)

        is_dup = False
        for i, existing_sig in enumerate(signatures):
            ratio = difflib.SequenceMatcher(None, sig, existing_sig).ratio()
            if ratio >= threshold_ratio:
                # Duplicate found: keep the more complete record
                if _record_completeness(record) > _record_completeness(result[i]):
                    result[i] = record
                    signatures[i] = sig
                is_dup = True
                break

        if not is_dup:
            result.append(record)
            signatures.append(sig)

    return result


# ---------------------------------------------------------------------------
# Relevance filtering
# ---------------------------------------------------------------------------

def filter_relevant(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filter records based on Google category relevance.

    - Keep records whose category matches RELEVANT_CATEGORIES
    - Remove records whose category matches EXCLUDE_CATEGORIES
    - Keep records with no category (may still be relevant)
    """
    filtered = []

    for record in records:
        categoria = (record.get("categoria_google") or "").strip().lower()

        # No category -> keep (benefit of the doubt)
        if not categoria:
            filtered.append(record)
            continue

        # Check exclusion first
        excluded = False
        for excl in EXCLUDE_CATEGORIES:
            if excl.lower() in categoria:
                excluded = True
                break

        if excluded:
            continue

        # If there are relevant categories defined, check if it matches any
        # If no relevant match is found but it was not excluded, keep it
        filtered.append(record)

    return filtered


# ---------------------------------------------------------------------------
# Horarios cleaning
# ---------------------------------------------------------------------------

_DAYS_MAP = {
    "monday": "Lun",
    "tuesday": "Mar",
    "wednesday": "Mié",
    "thursday": "Jue",
    "friday": "Vie",
    "saturday": "Sáb",
    "sunday": "Dom",
    "lunes": "Lun",
    "martes": "Mar",
    "miércoles": "Mié",
    "miercoles": "Mié",
    "jueves": "Jue",
    "viernes": "Vie",
    "sábado": "Sáb",
    "sabado": "Sáb",
    "domingo": "Dom",
}

_DAY_ORDER = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]


def clean_horarios(horarios_str: str) -> str:
    """
    Parse Google Maps aria-label style schedule and return clean format.

    Input examples:
        "Monday, 8 AM to 6 PM; Tuesday, 8 AM to 6 PM; ..."
        "lunes, 8:00 a 18:00; martes, 8:00 a 18:00; ..."
        "lunes de 8:00 a 18:00. martes de 8:00 a 18:00. ..."

    Output example:
        "Lun-Vie: 8:00-18:00, Sáb: 8:00-13:00"
    """
    if not horarios_str or not horarios_str.strip():
        return ""

    text = horarios_str.strip()

    # Split on common delimiters
    entries = re.split(r"[;.\n]", text)

    day_hours: Dict[str, str] = {}

    for entry in entries:
        entry = entry.strip()
        if not entry:
            continue

        entry_lower = entry.lower()

        # Find which day this entry is about
        matched_day = None
        for day_name, day_abbr in _DAYS_MAP.items():
            if day_name in entry_lower:
                matched_day = day_abbr
                break

        if not matched_day:
            continue

        # Check for closed
        if any(w in entry_lower for w in ["closed", "cerrado", "cerrada"]):
            day_hours[matched_day] = "Cerrado"
            continue

        # Extract time ranges
        # Pattern: HH:MM to/a HH:MM or H AM to H PM
        time_pattern = re.compile(
            r"(\d{1,2}(?::\d{2})?)\s*(?:AM|am|a\.?\s*m\.?)?"
            r"\s*(?:to|a|–|-|hasta)\s*"
            r"(\d{1,2}(?::\d{2})?)\s*(?:PM|pm|p\.?\s*m\.?)?",
            re.IGNORECASE,
        )

        match = time_pattern.search(entry)
        if match:
            start_raw = match.group(1)
            end_raw = match.group(2)

            # Convert AM/PM to 24h if needed
            start_time = _convert_to_24h(start_raw, entry, is_start=True)
            end_time = _convert_to_24h(end_raw, entry, is_start=False)

            day_hours[matched_day] = f"{start_time}-{end_time}"
        else:
            # Try simple numeric pattern
            nums = re.findall(r"\d{1,2}(?::\d{2})?", entry)
            if len(nums) >= 2:
                start_time = _ensure_time_format(nums[0])
                end_time = _ensure_time_format(nums[1])
                day_hours[matched_day] = f"{start_time}-{end_time}"

    if not day_hours:
        # Couldn't parse; return original cleaned up a bit
        return re.sub(r"\s+", " ", text).strip()

    # Group consecutive days with the same hours
    return _group_days(day_hours)


def _convert_to_24h(time_str: str, context: str, is_start: bool) -> str:
    """Convert a time string (possibly AM/PM) to 24h format."""
    context_lower = context.lower()
    time_str = time_str.strip()

    # Already in HH:MM format with values > 12 -> assume 24h
    parts = time_str.split(":")
    hour = int(parts[0])
    minute = parts[1] if len(parts) > 1 else "00"

    # Check for AM/PM in context
    has_am = bool(re.search(r"\b" + re.escape(time_str) + r"\s*(?:AM|a\.?\s*m\.?)", context, re.IGNORECASE))
    has_pm = bool(re.search(r"\b" + re.escape(time_str) + r"\s*(?:PM|p\.?\s*m\.?)", context, re.IGNORECASE))

    # If no explicit AM/PM, also check context-wide
    if not has_am and not has_pm:
        if "am" in context_lower or "a.m" in context_lower:
            has_am = True
        if "pm" in context_lower or "p.m" in context_lower:
            # For end times, PM is more likely
            if not is_start:
                has_pm = True
            else:
                has_am = True

    if has_pm and hour < 12:
        hour += 12
    elif has_am and hour == 12:
        hour = 0

    return f"{hour}:{minute}"


def _ensure_time_format(time_str: str) -> str:
    """Make sure time is in H:MM or HH:MM format."""
    if ":" in time_str:
        return time_str
    return f"{time_str}:00"


def _group_days(day_hours: Dict[str, str]) -> str:
    """
    Group consecutive days with the same hours into ranges.

    E.g., Lun: 8:00-18:00, Mar: 8:00-18:00, ... -> Lun-Vie: 8:00-18:00
    """
    # Build ordered list of (day_abbr, hours)
    ordered = []
    for day in _DAY_ORDER:
        if day in day_hours:
            ordered.append((day, day_hours[day]))

    if not ordered:
        return ""

    groups: List[tuple] = []  # (start_day, end_day, hours)
    current_start = ordered[0][0]
    current_end = ordered[0][0]
    current_hours = ordered[0][1]

    for i in range(1, len(ordered)):
        day, hours = ordered[i]
        prev_day_idx = _DAY_ORDER.index(current_end)
        this_day_idx = _DAY_ORDER.index(day)

        if hours == current_hours and this_day_idx == prev_day_idx + 1:
            # Extend current group
            current_end = day
        else:
            # Save current group and start new
            groups.append((current_start, current_end, current_hours))
            current_start = day
            current_end = day
            current_hours = hours

    groups.append((current_start, current_end, current_hours))

    # Format
    parts = []
    for start, end, hours in groups:
        if hours == "Cerrado":
            if start == end:
                parts.append(f"{start}: Cerrado")
            else:
                parts.append(f"{start}-{end}: Cerrado")
        elif start == end:
            parts.append(f"{start}: {hours}")
        else:
            parts.append(f"{start}-{end}: {hours}")

    return ", ".join(parts)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def parse_all(raw_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Run the full cleaning pipeline on raw scraped records.

    Steps:
        1. Normalize phones, detect celular/whatsapp
        2. Clean addresses
        3. Extract localidad if missing
        4. Classify zona if missing
        5. Get partido
        6. Deduplicate
        7. Filter irrelevant categories
        8. Clean horarios

    Returns the cleaned list of records.
    """
    known_localidades = list(LOCALIDAD_PARTIDO.keys())
    cleaned = []

    for record in raw_records:
        rec = dict(record)  # shallow copy

        # 1. Normalize phones
        telefono = rec.get("telefono") or ""
        if telefono:
            rec["telefono"] = normalize_phone(telefono)

        celular = rec.get("celular_whatsapp") or rec.get("celular") or ""
        if celular:
            rec["celular_whatsapp"] = normalize_phone(celular)
        elif telefono and detect_celular(telefono):
            # If the main phone looks like a mobile, copy it as whatsapp
            rec["celular_whatsapp"] = rec["telefono"]

        # Flag mobile detection
        rec["es_celular"] = detect_celular(
            rec.get("celular_whatsapp") or rec.get("telefono") or ""
        )

        # 2. Clean address
        direccion = rec.get("direccion") or ""
        if direccion:
            rec["direccion"] = clean_address(direccion)

        # 3. Extract localidad if missing
        localidad = (rec.get("localidad") or "").strip()
        if not localidad:
            localidad = extract_localidad_from_address(
                rec.get("direccion") or "", known_localidades
            )
            rec["localidad"] = localidad

        # 4. Classify zona if missing
        zona = (rec.get("zona") or "").strip()
        if not zona and localidad:
            rec["zona"] = classify_zona(localidad)

        # 5. Get partido
        partido = (rec.get("partido") or "").strip()
        if not partido and localidad:
            rec["partido"] = get_partido(localidad)

        # 8. Clean horarios (do this per-record before dedup/filter)
        horarios = rec.get("horarios") or ""
        if horarios:
            rec["horarios"] = clean_horarios(horarios)

        cleaned.append(rec)

    # 6. Deduplicate
    cleaned = deduplicate(cleaned)

    # 7. Filter irrelevant categories
    cleaned = filter_relevant(cleaned)

    return cleaned
