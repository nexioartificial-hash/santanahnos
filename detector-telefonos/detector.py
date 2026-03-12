"""
Detector y clasificador de numeros de telefono argentinos.
Procesa listas de numeros, normaliza y clasifica cada uno.
"""

from typing import List, Dict, Any, Optional
from normalizer import normalize, split_multiple_phones


def classify_phone(raw: str, default_area: str = '11') -> dict:
    """Normaliza y clasifica un numero de telefono argentino."""
    return normalize(raw, default_area)


def process_phone_list(
    phones: List[str],
    default_area: str = '11',
    extra_data: Optional[List[dict]] = None,
) -> List[dict]:
    """
    Procesa una lista de numeros, manejando campos con multiples telefonos.

    Args:
        phones: lista de strings con numeros de telefono
        default_area: codigo de area por defecto si no se detecta
        extra_data: lista de dicts con datos adicionales por cada entrada
                    (nombre, direccion, etc.) para mantener referencia

    Returns:
        Lista de dicts con resultados de clasificacion.
        Si una entrada tenia multiples telefonos, genera una fila por cada uno
        con un campo 'indice_original' para referencia.
    """
    results = []

    for i, raw_phone in enumerate(phones):
        if not raw_phone or not str(raw_phone).strip():
            result = normalize('', default_area)
            result['indice_original'] = i
            result['notas'] = 'Campo vacio'
            if extra_data and i < len(extra_data):
                result['datos_extra'] = extra_data[i]
            results.append(result)
            continue

        raw_str = str(raw_phone).strip()

        # Detectar multiples telefonos
        parts = split_multiple_phones(raw_str)

        if len(parts) <= 1:
            # Un solo numero
            result = classify_phone(raw_str, default_area)
            result['indice_original'] = i
            if extra_data and i < len(extra_data):
                result['datos_extra'] = extra_data[i]
            results.append(result)
        else:
            # Multiples numeros en un campo
            for j, part in enumerate(parts):
                result = classify_phone(part, default_area)
                result['indice_original'] = i
                result['sub_indice'] = j
                if extra_data and i < len(extra_data):
                    result['datos_extra'] = extra_data[i]
                if j == 0:
                    result['notas'] = (result.get('notas', '') + '; Campo con multiples telefonos').strip('; ')
                results.append(result)

    return results


def generate_stats(results: List[dict]) -> dict:
    """Genera estadisticas del analisis."""
    total = len(results)
    fijos = sum(1 for r in results if r['tipo'] == 'fijo')
    celulares = sum(1 for r in results if r['tipo'] == 'celular')
    no_clasificados = sum(1 for r in results if r['tipo'] == 'no_clasificado')
    wa_probable = sum(1 for r in results if r['whatsapp_probable'])
    wa_verificado = sum(1 for r in results if r.get('whatsapp_verificado') is True)
    confianza_alta = sum(1 for r in results if r['confianza'] == 'alta')
    confianza_media = sum(1 for r in results if r['confianza'] == 'media')
    confianza_baja = sum(1 for r in results if r['confianza'] == 'baja')

    return {
        'total': total,
        'fijos': fijos,
        'celulares': celulares,
        'no_clasificados': no_clasificados,
        'pct_fijos': round(fijos / total * 100, 1) if total else 0,
        'pct_celulares': round(celulares / total * 100, 1) if total else 0,
        'pct_no_clasificados': round(no_clasificados / total * 100, 1) if total else 0,
        'whatsapp_probable': wa_probable,
        'whatsapp_verificado': wa_verificado,
        'confianza_alta': confianza_alta,
        'confianza_media': confianza_media,
        'confianza_baja': confianza_baja,
        'pct_confianza_alta': round(confianza_alta / total * 100, 1) if total else 0,
        'pct_confianza_media': round(confianza_media / total * 100, 1) if total else 0,
        'pct_confianza_baja': round(confianza_baja / total * 100, 1) if total else 0,
    }


def print_stats(stats: dict) -> None:
    """Muestra el resumen en consola."""
    print()
    print('=' * 40)
    print('         RESUMEN DEL ANALISIS')
    print('=' * 40)
    print(f"  Total numeros analizados: {stats['total']}")
    print('-' * 40)
    print(f"  Lineas fijas:      {stats['fijos']:>5}  ({stats['pct_fijos']}%)")
    print(f"  Celulares:         {stats['celulares']:>5}  ({stats['pct_celulares']}%)")
    print(f"  No clasificados:   {stats['no_clasificados']:>5}  ({stats['pct_no_clasificados']}%)")
    print('-' * 40)
    print(f"  WhatsApp probable: {stats['whatsapp_probable']:>5}")
    if stats['whatsapp_verificado']:
        print(f"  WhatsApp verificado: {stats['whatsapp_verificado']:>3}")
    print('-' * 40)
    print(f"  Confianza ALTA:    {stats['confianza_alta']:>5}  ({stats['pct_confianza_alta']}%)")
    print(f"  Confianza MEDIA:   {stats['confianza_media']:>5}  ({stats['pct_confianza_media']}%)")
    print(f"  Confianza BAJA:    {stats['confianza_baja']:>5}  ({stats['pct_confianza_baja']}%)")
    print('=' * 40)
    print()
