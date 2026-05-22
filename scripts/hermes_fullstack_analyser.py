#!/usr/bin/env python3
"""
Agente Hermes Fullstack.

System Prompt:
Eres un Agente Hermes de Infraestructura y Fullstack Performance. Tu misión es auditar código fuente para garantizar ejecución limpia en dispositivos móviles, corregir errores sintácticos y optimizar el pipeline de datos Supabase -> Vercel Edge Network.

Tus tareas críticas son:
1. Identificar y reparar errores de sintaxis (JS/TS/Python) que bloqueen el hilo principal.
2. Asegurar que las consultas a Supabase utilicen técnicas de resiliencia móvil (Connection Pooling, subscripciones limpias, manejo de timeouts).
3. Verificar que las Serverless/Edge Functions de Vercel no sufran "Cold Starts" prolongados que afecten al celular.

Este script amplía las capacidades del agente anterior. Analiza tus archivos de código buscando errores de sintaxis comunes, malas prácticas de Supabase y patrones de conexión ineficientes que arruinan la experiencia móvil.
"""

import argparse
import os
import re
import sys
from typing import Dict, List

AGENT_SYSTEM_PROMPT = """
Eres un Agente Hermes de Infraestructura y Fullstack Performance. Tu misión es auditar código fuente para garantizar ejecución limpia en dispositivos móviles, corregir errores sintácticos y optimizar el pipeline de datos Supabase -> Vercel Edge Network.

Tus tareas críticas son:
1. Identificar y reparar errores de sintaxis (JS/TS/Python) que bloqueen el hilo principal.
2. Asegurar que las consultas a Supabase utilicen técnicas de resiliencia móvil (Connection Pooling, subscripciones limpias, manejo de timeouts).
3. Verificar que las Serverless/Edge Functions de Vercel no sufran "Cold Starts" prolongados que afecten al celular.
"""

PATRONES_SINTAXIS = {
    "promesa_sin_catch": (
        r"\.(then|promise\(|supabase[\w\.]*\()\s*\([^\)]*\)(?!\s*\.catch)",
        "Promesa o llamada a Supabase sin manejo de errores (.catch o try/catch). En celular puede colgar la app si falla la red."
    ),
    "query_sin_limite": (
        r"from\([^)]+\)\s*\.\s*select\([^\)]+\)(?![\s\S]{0,80}\.limit)",
        "Consulta a Supabase sin cláusula .limit(). Puede descargar miles de filas innecesarias en el celular."
    ),
    "consola_en_produccion": (
        r"console\.log\(",
        "Residuos de console.log que saturan la memoria del navegador móvil en producción."
    ),
    "use_effect_sin_limpieza": (
        r"useEffect\s*\(\s*\([^\)]*\)\s*=>\s*\{[^\}]*((\n|.)*?)\}\s*\)",
        "useEffect en React que inicializa eventos o canales de Supabase sin función de limpieza (cleanup). Causa fugas de memoria."
    ),
}

VALID_EXTENSIONS = ('.js', '.jsx', '.ts', '.tsx', '.py')
EXCLUDED_DIRS = ('node_modules', '.next', '.git', 'dist', 'build', '__pycache__')


def analizar_codigo_fuente(nombre_archivo: str, contenido: str) -> List[Dict[str, object]]:
    alertas = []

    for clave, (patron, descripcion) in PATRONES_SINTAXIS.items():
        coincidencias = re.findall(patron, contenido, re.IGNORECASE)
        if coincidencias:
            alertas.append({
                "tipo": clave,
                "descripcion": descripcion,
                "ocurrencias": len(coincidencias),
            })

    contenido_lower = contenido.lower()
    if "supabase" in contenido_lower:
        if "anon" in contenido_lower and "service_role" in contenido_lower:
            alertas.append({
                "tipo": "seguridad_supabase",
                "descripcion": "Se detectó uso potencial de 'service_role' en código que podría exponerse al cliente móvil. Peligro de seguridad.",
                "ocurrencias": 1,
            })

        # Detectar suscripciones o canales sin cleanup.
        if "realtime" in contenido_lower and "unsubscribe" not in contenido_lower and "removechannel" not in contenido_lower:
            alertas.append({
                "tipo": "suscripcion_supabase_sin_limpieza",
                "descripcion": "Suscripción de Supabase/Realtime detectada sin manejo de limpieza. Puede causar conexiones persistentes y fugas en mobile.",
                "ocurrencias": 1,
            })

        if "select(" in contenido_lower and ".limit(" not in contenido_lower:
            alertas.append({
                "tipo": "query_supabase_sin_limit_global",
                "descripcion": "Se detectó una consulta Supabase que posiblemente no limita resultados. Revisa filtros y paginación para redes móviles.",
                "ocurrencias": 1,
            })

    return alertas


def es_directorio_excluido(raiz: str) -> bool:
    return any(excl in raiz for excl in EXCLUDED_DIRS)


def ejecutar_auditoria_completa(ruta_proyecto: str) -> List[Dict[str, object]]:
    resultados = []
    print(f"🕵️‍♂️ [Agente Hermes Fullstack] Iniciando inspección en: {ruta_proyecto}\n")

    if not os.path.exists(ruta_proyecto):
        print("❌ La ruta especificada no existe.")
        return resultados

    for raiz, dirs, archivos in os.walk(ruta_proyecto):
        if es_directorio_excluido(raiz):
            continue

        for archivo in archivos:
            if archivo.endswith(VALID_EXTENSIONS):
                ruta_completa = os.path.join(raiz, archivo)
                try:
                    with open(ruta_completa, 'r', encoding='utf-8', errors='ignore') as f:
                        contenido = f.read()

                    hallazgos = analizar_codigo_fuente(archivo, contenido)
                    if hallazgos:
                        relpath = os.path.relpath(ruta_completa, ruta_proyecto)
                        resultados.append({
                            "archivo": relpath,
                            "hallazgos": hallazgos,
                        })
                        print(f"📄 Archivo Comprometido: {relpath}")
                        for h in hallazgos:
                            print(f"   ⚠️  [{h['tipo'].upper()}] {h['descripcion']} (Detectado {h['ocurrencias']} veces)")
                        print("-" * 60)
                except Exception as e:
                    print(f"❌ No se pudo analizar {archivo}: {str(e)}")
    if not resultados:
        print("✅ No se detectaron hallazgos críticos en el análisis estático.")
    return resultados


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Hermes Fullstack Analyser para Supabase + Vercel.')
    parser.add_argument(
        'ruta',
        nargs='?',
        default='./src',
        help='Ruta raíz del proyecto o carpeta a auditar (por defecto: ./src)'
    )
    parser.add_argument(
        '--prompt',
        action='store_true',
        help='Imprimir el sistema de prompt que debe inicializar este agente.'
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Emitir resultado en formato JSON al final.'
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.prompt:
        print(AGENT_SYSTEM_PROMPT)
        return 0

    resultados = ejecutar_auditoria_completa(args.ruta)

    if args.json:
        import json
        print(json.dumps(resultados, indent=2, ensure_ascii=False))

    return 0


if __name__ == '__main__':
    sys.exit(main())
