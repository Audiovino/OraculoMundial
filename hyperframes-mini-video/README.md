# HyperFrames Mini-Video: Cómo usar Mini-Ligas

Esta carpeta contiene una composición HyperFrames para generar un mini video explicativo de la función `Mini-Ligas`.

## Archivos

- `index.html`: composición HTML/CSS/JS para el video.
- `hyperframes.json`: configuración de renderizado.
- `package.json`: define dependencias y scripts.

## Cómo usar

1. Instalar dependencias:
   ```bash
   cd hyperframes-mini-video
   npm install
   ```

2. Renderizar el video:
   ```bash
   npx hyperframes render
   ```

3. Renderizar usando Docker con GPU (recomendado si tenés NVIDIA/CUDA):
   ```bash
   npx hyperframes render --docker
   ```

   > IMPORTANTE: Docker Desktop debe estar en ejecución antes de usar este comando.
   > Si Docker no está activo, verás un error como `failed to connect to the docker API`.

4. Verificar la vista previa:
   ```bash
   npx hyperframes preview
   ```

## Cómo usar GPU con Docker y NVIDIA

Si querés acelerar el render con tu GPU, seguí estos pasos:

1. Instalá Docker Desktop en Windows.
2. Instalá el `NVIDIA Container Toolkit` para permitir el acceso a la GPU desde contenedores.
3. Asegurate de que Docker reconoce la GPU ejecutando:
   ```bash
   docker run --gpus all --rm nvidia/cuda:12.2.0-runtime-ubuntu22.04 nvidia-smi
   ```
4. Ejecutá el render con Docker desde la carpeta `hyperframes-mini-video`:
   ```bash
   npm run render-gpu
   ```

### Nota

- `hyperframes render --docker` hace que HyperFrames use un contenedor con Chromium en vez del navegador del host.
- El flag `--docker` puede resolver errores como `window.__hf not ready after 45000ms`.
- Si el contenedor no detecta la GPU, revisá la configuración del runtime de NVIDIA en Docker.

## Qué explica el video

- Qué es `Mini-Ligas`
- Cómo usarlo con los pronósticos del Mundial
- Cómo competir solo con tu grupo de amigos

## Nota

Si ya tienes HyperFrames instalado globalmente, puedes usar `hyperframes render` directamente en lugar de `npx hyperframes render`.
