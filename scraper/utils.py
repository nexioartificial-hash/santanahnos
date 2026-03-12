"""
Utilidades para el scraper de Google Maps - Santana Hnos.
Incluye rotación de user-agents, delays, logging, checkpoints y barra de progreso.
"""

import asyncio
import json
import logging
import os
import re
import sys
import time
import random
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional


# ---------------------------------------------------------------------------
# User-Agent rotation
# ---------------------------------------------------------------------------

USER_AGENTS = [
    # Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    # Chrome on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    # Firefox on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    # Edge on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
]


def get_random_ua() -> str:
    """Return a random user-agent string from the pool."""
    return random.choice(USER_AGENTS)


# ---------------------------------------------------------------------------
# Random delay
# ---------------------------------------------------------------------------

async def random_delay(min_sec: float, max_sec: float) -> float:
    """
    Sleep for a random duration between *min_sec* and *max_sec* seconds.
    Returns the actual time slept.
    """
    delay = random.uniform(min_sec, max_sec)
    await asyncio.sleep(delay)
    return delay


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def setup_logger(
    name: str,
    log_dir: str = "logs",
    level: int = logging.DEBUG,
) -> logging.Logger:
    """
    Create and return a logger that writes to both a file and the console.

    Log format: [TIMESTAMP] [LEVEL] [CONTEXT] message
    The log file is named ``{name}_{YYYYMMDD_HHMMSS}.log`` inside *log_dir*.
    """
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_path / f"{name}_{timestamp_str}.log"

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid adding duplicate handlers if called more than once
    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)-8s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler
    fh = logging.FileHandler(str(log_file), encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    return logger


# ---------------------------------------------------------------------------
# Checkpoint save / load
# ---------------------------------------------------------------------------

def save_checkpoint(data: List[Dict[str, Any]], filepath: str) -> None:
    """
    Persist *data* (list of dicts) to a JSON file at *filepath*.
    Creates parent directories if they don't exist.
    Writes to a temporary file first, then renames for atomicity.
    """
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)

    tmp_path = path.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Atomic rename (on Windows this replaces the target if it exists on Python 3.3+)
    if path.exists():
        path.unlink()
    tmp_path.rename(path)


def load_checkpoint(filepath: str) -> List[Dict[str, Any]]:
    """
    Load and return checkpoint data from *filepath*.
    Returns an empty list if the file does not exist or is corrupt.
    """
    path = Path(filepath)
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        return []
    except (json.JSONDecodeError, OSError):
        return []


# ---------------------------------------------------------------------------
# Progress bar
# ---------------------------------------------------------------------------

class ProgressBar:
    """
    Simple console progress bar.

    Usage::

        pb = ProgressBar(total=500, prefix="Scraping")
        for i in range(500):
            do_work()
            pb.update(1)
        pb.finish()

    Output example::

        Scraping [████████░░░░░░░░░░░░] 40% | 200/500 | ETA: 3m 12s
    """

    def __init__(self, total: int, prefix: str = "", bar_length: int = 30):
        self.total = max(total, 1)
        self.prefix = prefix
        self.bar_length = bar_length
        self.current = 0
        self._start_time = time.time()

    def update(self, increment: int = 1) -> None:
        """Advance the progress bar by *increment* units and redraw."""
        self.current = min(self.current + increment, self.total)
        self._draw()

    def _draw(self) -> None:
        fraction = self.current / self.total
        filled = int(self.bar_length * fraction)
        bar = "\u2588" * filled + "\u2591" * (self.bar_length - filled)

        percent = int(fraction * 100)

        # ETA calculation
        elapsed = time.time() - self._start_time
        if self.current > 0 and self.current < self.total:
            remaining_sec = (elapsed / self.current) * (self.total - self.current)
            eta_str = self._format_eta(remaining_sec)
        elif self.current >= self.total:
            eta_str = "done"
        else:
            eta_str = "..."

        line = f"\r{self.prefix} [{bar}] {percent}% | {self.current}/{self.total} | ETA: {eta_str}"
        sys.stdout.write(line)
        sys.stdout.flush()

    @staticmethod
    def _format_eta(seconds: float) -> str:
        """Format seconds into a human-readable short string like '5m 12s'."""
        seconds = max(0, int(seconds))
        if seconds < 60:
            return f"{seconds}s"
        minutes = seconds // 60
        secs = seconds % 60
        if minutes < 60:
            return f"{minutes}m {secs}s" if secs else f"{minutes}m"
        hours = minutes // 60
        mins = minutes % 60
        return f"{hours}h {mins}m"

    def finish(self) -> None:
        """Mark progress as complete and print a newline."""
        self.current = self.total
        self._draw()
        sys.stdout.write("\n")
        sys.stdout.flush()


# ---------------------------------------------------------------------------
# Captcha detection
# ---------------------------------------------------------------------------

async def is_captcha_page(page) -> bool:
    """
    Check if a Playwright *page* is showing a CAPTCHA challenge.

    Looks for:
      - reCAPTCHA iframes
      - "unusual traffic" / "tráfico inusual" text in the page body
      - Google's sorry page patterns
    """
    try:
        # Check for reCAPTCHA iframe
        recaptcha_frame = await page.query_selector(
            'iframe[src*="recaptcha"], iframe[src*="captcha"]'
        )
        if recaptcha_frame:
            return True

        # Check page text for known captcha/block messages
        body_text = (await page.inner_text("body")).lower()
        captcha_signals = [
            "unusual traffic",
            "tráfico inusual",
            "not a robot",
            "no soy un robot",
            "sorry/banning",
            "systems have detected unusual traffic",
            "nuestros sistemas han detectado",
            "complete the captcha",
        ]
        for signal in captcha_signals:
            if signal in body_text:
                return True

        # Check URL for Google's sorry/captcha redirect
        current_url = page.url.lower()
        if "sorry" in current_url and "google" in current_url:
            return True

        return False
    except Exception:
        # If we can't check, assume no captcha to avoid false positives
        return False


# ---------------------------------------------------------------------------
# Argentine phone number normalization
# ---------------------------------------------------------------------------

_PHONE_STRIP_RE = re.compile(r"[^\d+]")


def normalize_phone_ar(phone_str: str) -> str:
    """
    Normalize an Argentine phone number string to a consistent format.

    Rules applied:
      1. Strip all non-digit characters (keep leading '+').
      2. Remove international prefix variations (+54, 0054, 54) at the start.
      3. Remove trunk prefix '0' if present after country code removal.
      4. Remove '15' mobile prefix when preceded by area code.
      5. Return in the format ``+54 11 XXXX-XXXX`` (for Buenos Aires area code 11).

    Examples::

        "011 15 4567-8901"  -> "+54 11 4567-8901"
        "+54 9 11 4567-8901" -> "+54 11 4567-8901"
        "4567-8901"          -> "4567-8901"  (no area code, returned cleaned)
    """
    if not phone_str or not phone_str.strip():
        return ""

    raw = phone_str.strip()

    # Keep '+' at start, strip everything else that is not a digit
    has_plus = raw.startswith("+")
    digits = re.sub(r"\D", "", raw)

    if not digits:
        return ""

    # Remove country code +54 / 0054 / 54
    if has_plus and digits.startswith("54"):
        digits = digits[2:]
    elif digits.startswith("0054"):
        digits = digits[4:]
    elif not has_plus and digits.startswith("54") and len(digits) > 10:
        digits = digits[2:]

    # Remove leading '9' used in international mobile format (+54 9 ...)
    if digits.startswith("9") and len(digits) == 11:
        digits = digits[1:]

    # Remove trunk '0' (e.g., 011 -> 11)
    if digits.startswith("0"):
        digits = digits[1:]

    # Remove '15' mobile prefix after area code (e.g., 11 15 XXXX XXXX -> 11 XXXX XXXX)
    if len(digits) == 12 and digits[:2] == "11" and digits[2:4] == "15":
        digits = digits[:2] + digits[4:]
    elif len(digits) == 10 and digits[:2] == "11":
        # Already in correct 10-digit form: area(2) + number(8)
        pass
    elif len(digits) == 8:
        # Local number without area code, return cleaned
        return f"{digits[:4]}-{digits[4:]}"

    # Format as +54 XX XXXX-XXXX for 10-digit numbers
    if len(digits) == 10:
        area = digits[:2]
        first = digits[2:6]
        second = digits[6:10]
        return f"+54 {area} {first}-{second}"

    # Fallback: return digits with country code if long enough
    if len(digits) > 6:
        return f"+54 {digits}"

    return digits


def is_celular(phone_str: str) -> bool:
    """
    Return True if *phone_str* looks like an Argentine mobile number.

    Detection heuristics:
      - Contains '15' as the mobile prefix (common in local dialling).
      - After normalization, the subscriber number (last 8 digits for area 11)
        starts with certain mobile prefixes (2, 3, 4, 5, 6 are landline-ish;
        numbers starting with 15 in raw form or subscriber part starting with
        certain digits indicate mobile).
      - International format: +54 9 XX ... indicates mobile.
    """
    if not phone_str or not phone_str.strip():
        return False

    raw = phone_str.strip()

    # Explicit mobile indicator in international format
    if "+54 9 " in raw or "+549" in raw:
        return True

    # Check for '15' prefix in the raw string (local mobile dialling)
    digits = re.sub(r"\D", "", raw)

    # Remove country code to work with local digits
    if digits.startswith("54") and len(digits) > 10:
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]

    # Pattern: area_code(2) + 15 + number(8) -> mobile
    # e.g., 11 15 4567 8901
    if digits.startswith("11") and len(digits) >= 10:
        subscriber = digits[2:]
        if subscriber.startswith("15"):
            return True

    # Pattern: 15 at the start (local mobile, no area code)
    if digits.startswith("15") and len(digits) in (10, 8):
        return True

    # After normalization, check if the 8-digit subscriber for area 11
    # matches known mobile ranges. In Argentina, mobile numbers for BA (11)
    # after removing 15 typically start with digits in the 2-7 range
    # but the most reliable indicator is the presence of '15'.
    # For broader detection, numbers with 9 after country code are mobile.
    if "9" == digits[0] and len(digits) == 11:
        return True

    return False
