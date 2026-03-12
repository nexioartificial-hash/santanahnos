"""
Verificador de WhatsApp para numeros argentinos.
Dos metodos: verificacion via wa.me (HTTP) o solo generacion de links.
"""

import time
import sys
from typing import List
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def generate_wa_links(results: List[dict]) -> List[dict]:
    """Genera links wa.me para todos los celulares."""
    for r in results:
        if r['es_celular'] and r.get('link_whatsapp'):
            r['whatsapp_verificado'] = None  # No verificado
    return results


def check_whatsapp_active(results: List[dict], delay: float = 2.5) -> List[dict]:
    """
    Verifica si los numeros de celular tienen WhatsApp activo
    haciendo requests HEAD a wa.me.

    NOTA: Este metodo no es 100% confiable. wa.me redirige para
    todos los numeros validos en formato E.164, no solo los que
    tienen WhatsApp. Se usa como aproximacion.
    """
    if not HAS_REQUESTS:
        print('\n  [!] Libreria "requests" no instalada.')
        print('      pip install requests')
        print('      Se omite verificacion de WhatsApp.\n')
        return generate_wa_links(results)

    celulares = [r for r in results if r['es_celular'] and r.get('link_whatsapp')]
    total = len(celulares)

    if total == 0:
        print('  No hay celulares para verificar.')
        return results

    print(f'\n  Verificando WhatsApp en {total} numeros...')
    print(f'  (delay de {delay}s entre requests para evitar bloqueo)\n')

    verificados = 0
    for i, r in enumerate(celulares):
        url = r['link_whatsapp']
        try:
            resp = requests.head(
                url,
                timeout=8,
                allow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                                  'AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
                },
            )
            # wa.me redirige a api.whatsapp.com para numeros validos
            if resp.status_code in (200, 301, 302):
                r['whatsapp_verificado'] = True
                verificados += 1
            else:
                r['whatsapp_verificado'] = False
        except Exception:
            r['whatsapp_verificado'] = None  # Error de conexion

        # Barra de progreso
        pct = (i + 1) / total * 100
        bar_len = 30
        filled = int(bar_len * (i + 1) / total)
        bar = '#' * filled + '-' * (bar_len - filled)
        sys.stdout.write(f'\r  [{bar}] {pct:.0f}% | {i + 1}/{total} | Verificados: {verificados}')
        sys.stdout.flush()

        if i < total - 1:
            time.sleep(delay)

    print('\n')
    return results


def ask_and_verify(results: List[dict]) -> List[dict]:
    """Pregunta al usuario si quiere verificar WhatsApp y ejecuta."""
    celulares = sum(1 for r in results if r['es_celular'])
    if celulares == 0:
        print('  No se encontraron celulares para verificar.')
        return results

    print(f'\n  Se encontraron {celulares} celulares.')
    print('  Opciones de verificacion WhatsApp:')
    print('    1. Solo generar links wa.me (rapido, sin verificar)')
    print('    2. Verificar WhatsApp activo via HTTP (lento, ~{:.0f} min)'.format(celulares * 2.5 / 60))
    print('    3. Omitir')

    while True:
        choice = input('\n  Opcion (1-3): ').strip()
        if choice == '1':
            return generate_wa_links(results)
        elif choice == '2':
            return check_whatsapp_active(results)
        elif choice == '3':
            return results
        else:
            print('  Opcion invalida.')
