#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';

console.log("🎬 [Hermes] Iniciando proceso de generación de video...");

// 1. Asegurar que los directorios necesarios existen
if (!fs.existsSync('demos')) fs.mkdirSync('demos');
if (!fs.existsSync('demos_raw')) fs.mkdirSync('demos_raw');

// 1.1 Preparar carpeta para HyperFrames
const demoDir = 'hyperframes-mini-video/spectacular-demo';
if (fs.existsSync(demoDir) && !fs.lstatSync(demoDir).isDirectory()) {
    fs.unlinkSync(demoDir); // Elimina si existía como archivo por error
}
if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true });
}
if (fs.existsSync('hyperframes-mini-video/index.html') && !fs.existsSync(`${demoDir}/index.html`)) {
    fs.copyFileSync('hyperframes-mini-video/index.html', `${demoDir}/index.html`);
}

// 2. Ejecutar la grabación con Playwright (Captura raw)
console.log("🎥 [1/2] Capturando navegación automatizada con Playwright...");
// Usamos el ejecutable de node actual para asegurar compatibilidad en Windows
// Añadimos comillas a la ruta para manejar espacios en "C:\Program Files"
const record = spawnSync(`"${process.execPath}"`, ['scripts/generate_auto_demo.mjs'], { stdio: 'inherit', shell: true });

if (record.status !== 0) {
    console.error("❌ Error: La grabación falló.");
    process.exit(1);
}

// 3. Renderizado cinematográfico con HyperFrames y NVIDIA GPU
console.log("🚀 [2/2] Renderizando composición estilo Apple con NVIDIA GeForce...");
const render = spawnSync('npx', [
    'hyperframes', 'render', 'hyperframes-mini-video/spectacular-demo',
    '--gpu', '--quality', 'high', '--output', 'public/demo_final.mp4'
], { stdio: 'inherit', shell: true });

if (render.status !== 0) {
    console.error("❌ Error: El renderizado falló.");
    process.exit(1);
}

console.log("🎉 [Hermes] ¡Proceso exitoso! Video generado en: public/demo_final.mp4");