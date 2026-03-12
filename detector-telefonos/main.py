"""
Detector de Telefonos Argentinos - Santana Hnos.
Script principal con menu interactivo.
"""

import os
import sys
import glob

import pandas as pd

from detector import process_phone_list, generate_stats, print_stats
from whatsapp_checker import ask_and_verify
from exporter import export_all


INPUT_DIR = os.path.join(os.path.dirname(__file__), 'data', 'input')
os.makedirs(INPUT_DIR, exist_ok=True)


def print_header():
    print()
    print('=' * 50)
    print('    DETECTOR DE TELEFONOS ARGENTINOS')
    print('    Santana Hnos. - Herramienta interna')
    print('=' * 50)
    print()


def find_files(ext: str) -> list:
    """Busca archivos con la extension dada en data/input/."""
    pattern = os.path.join(INPUT_DIR, f'*.{ext}')
    return sorted(glob.glob(pattern))


def select_file(ext: str) -> str:
    """Permite al usuario elegir un archivo."""
    files = find_files(ext)
    if not files:
        print(f'\n  No se encontraron archivos .{ext} en data/input/')
        print(f'  Coloca tu archivo en: {os.path.abspath(INPUT_DIR)}')
        input('\n  Presiona Enter cuando hayas colocado el archivo...')
        files = find_files(ext)
        if not files:
            print('  Sigue sin encontrarse. Abortando.')
            return None

    if len(files) == 1:
        print(f'\n  Archivo encontrado: {os.path.basename(files[0])}')
        return files[0]

    print(f'\n  Archivos .{ext} encontrados:')
    for i, f in enumerate(files, 1):
        print(f'    {i}. {os.path.basename(f)}')

    while True:
        choice = input(f'\n  Selecciona (1-{len(files)}): ').strip()
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(files):
                return files[idx]
        except ValueError:
            pass
        print('  Opcion invalida.')


def load_from_excel() -> tuple:
    """Carga numeros desde un archivo Excel."""
    filepath = select_file('xlsx')
    if not filepath:
        return [], None

    df = pd.read_excel(filepath, dtype=str)
    print(f'\n  Columnas encontradas:')
    for i, col in enumerate(df.columns, 1):
        sample = df[col].dropna().iloc[0] if not df[col].dropna().empty else '(vacio)'
        print(f'    {i}. {col}  ->  ej: {sample}')

    while True:
        choice = input(f'\n  Cual columna tiene los telefonos? (1-{len(df.columns)}): ').strip()
        try:
            col_idx = int(choice) - 1
            if 0 <= col_idx < len(df.columns):
                phone_col = df.columns[col_idx]
                break
        except ValueError:
            pass
        print('  Opcion invalida.')

    phones = df[phone_col].fillna('').astype(str).tolist()

    # Mantener otras columnas como datos extra
    other_cols = [c for c in df.columns if c != phone_col]
    extra_data = None
    if other_cols:
        extra_data = df[other_cols].to_dict('records')

    return phones, extra_data


def load_from_csv() -> tuple:
    """Carga numeros desde un archivo CSV."""
    filepath = select_file('csv')
    if not filepath:
        return [], None

    # Intentar detectar separador
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        first_line = f.readline()

    sep = ';' if ';' in first_line else ','
    df = pd.read_csv(filepath, sep=sep, dtype=str, encoding='utf-8-sig')

    print(f'\n  Columnas encontradas:')
    for i, col in enumerate(df.columns, 1):
        sample = df[col].dropna().iloc[0] if not df[col].dropna().empty else '(vacio)'
        print(f'    {i}. {col}  ->  ej: {sample}')

    while True:
        choice = input(f'\n  Cual columna tiene los telefonos? (1-{len(df.columns)}): ').strip()
        try:
            col_idx = int(choice) - 1
            if 0 <= col_idx < len(df.columns):
                phone_col = df.columns[col_idx]
                break
        except ValueError:
            pass
        print('  Opcion invalida.')

    phones = df[phone_col].fillna('').astype(str).tolist()

    other_cols = [c for c in df.columns if c != phone_col]
    extra_data = None
    if other_cols:
        extra_data = df[other_cols].to_dict('records')

    return phones, extra_data


def load_from_txt() -> tuple:
    """Carga numeros desde un archivo de texto (uno por linea)."""
    filepath = select_file('txt')
    if not filepath:
        return [], None

    with open(filepath, 'r', encoding='utf-8-sig') as f:
        phones = [line.strip() for line in f if line.strip()]

    return phones, None


def load_manual() -> tuple:
    """Carga numeros ingresados manualmente."""
    print('\n  Ingresa los numeros uno por linea.')
    print('  Escribi "fin" o linea vacia para terminar.\n')

    phones = []
    while True:
        line = input('  > ').strip()
        if not line or line.lower() == 'fin':
            break
        phones.append(line)

    return phones, None


def load_paste() -> tuple:
    """Carga numeros pegados en bloque."""
    print('\n  Pega la lista de numeros (uno por linea).')
    print('  Cuando termines, escribi "fin" en una linea aparte.\n')

    phones = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip().lower() == 'fin':
            break
        if line.strip():
            phones.append(line.strip())

    return phones, None


def main():
    print_header()

    print('  Como queres cargar los numeros?\n')
    print('    1. Desde archivo Excel (.xlsx)')
    print('    2. Desde archivo CSV (.csv)')
    print('    3. Desde archivo de texto (.txt)')
    print('    4. Ingresar numeros manualmente')
    print('    5. Pegar lista de numeros')

    while True:
        choice = input('\n  Opcion (1-5): ').strip()
        if choice in ('1', '2', '3', '4', '5'):
            break
        print('  Opcion invalida.')

    loaders = {
        '1': load_from_excel,
        '2': load_from_csv,
        '3': load_from_txt,
        '4': load_manual,
        '5': load_paste,
    }

    phones, extra_data = loaders[choice]()

    if not phones:
        print('\n  No se cargaron numeros. Saliendo.')
        return

    print(f'\n  Se cargaron {len(phones)} registros. Procesando...')

    # Procesar
    results = process_phone_list(phones, default_area='11', extra_data=extra_data)
    print(f'  Se generaron {len(results)} resultados (algunos registros tenian multiples telefonos).')

    # Verificacion WhatsApp
    results = ask_and_verify(results)

    # Stats
    stats = generate_stats(results)
    print_stats(stats)

    # Exportar
    print('  Exportando resultados...')
    paths = export_all(results, stats)

    print('  Archivos generados:')
    for fmt, path in paths.items():
        print(f'    [{fmt.upper()}] {path}')

    print('\n  Listo!\n')


if __name__ == '__main__':
    main()
