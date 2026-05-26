#!/bin/bash

# script de automatización del Agente Hermes
# Propósito: Grabar y renderizar la demo de Oráculo Mundial en un solo paso

echo "🎬 [Hermes] Iniciando proceso de generación de video..."

# 1. Asegurar que los directorios necesarios existen
mkdir -p demos demos_raw

# 2. Ejecutar la grabación con Playwright (Captura raw)
echo "🎥 [1/2] Capturando navegación automatizada con Playwright..."
node scripts/generate_auto_demo.mjs

if [ $? -ne 0 ]; then
    echo "❌ Error: La grabación falló."
    exit 1
fi

# 3. Renderizado cinematográfico con HyperFrames y NVIDIA GPU
echo "🚀 [2/2] Renderizando composición estilo Apple con NVIDIA GeForce..."
npx hyperframes render hyperframes-mini-video/spectacular-demo --gpu --quality high --output public/demo_final.mp4

echo "🎉 [Hermes] ¡Proceso exitoso! Video generado en: public/demo_final.mp4"