import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
import { WORLD_CUP_2026_STADIUMS } from '../src/data/StadiumsData';

import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.VITE_TRIPO_API_KEY;
if (!API_KEY) {
  console.error('Error: VITE_TRIPO_API_KEY no está definido en el archivo .env');
  process.exit(1);
}

const PUBLIC_MODELS_DIR = path.join(__dirname, '../public/models');

// Crear directorio si no existe
if (!fs.existsSync(PUBLIC_MODELS_DIR)) {
  fs.mkdirSync(PUBLIC_MODELS_DIR, { recursive: true });
}

// Para evitar HTTP 403 en Wikimedia
const WIKIMEDIA_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  console.log(`[Descargando imagen] ${url}`);
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 
      'User-Agent': WIKIMEDIA_USER_AGENT,
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://commons.wikimedia.org/'
    }
  });
  return Buffer.from(response.data);
}

async function createTripoTask(imageBuffer: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  form.append('type', 'image_to_model');
  form.append('file', imageBuffer, { filename });
  
  const res = await axios.post('https://api.tripo3d.ai/v2/openapi/task', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (res.data.code === 0 && res.data.data && res.data.data.task_id) {
    return res.data.data.task_id;
  }
  
  throw new Error(`Error al crear la tarea en Tripo: ${JSON.stringify(res.data)}`);
}

async function pollTripoTask(taskId: string): Promise<string> {
  console.log(`[Polling] Esperando que Tripo termine la tarea ${taskId}...`);
  while (true) {
    const res = await axios.get(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const { status, result, progress } = res.data.data;
    console.log(`[Polling] Tarea ${taskId} - Status: ${status} - Progreso: ${progress}%`);
    
    if (status === 'success') {
      return result.model.url;
    } else if (status === 'failed' || status === 'cancelled') {
      throw new Error(`La tarea falló: ${status}`);
    }
    
    // Esperar 10 segundos antes del siguiente poll
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function downloadModel(url: string, destPath: string) {
  const writer = fs.createWriteStream(destPath);
  const response = await axios.get(url, { responseType: 'stream' });
  
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error: Error | null = null;
    writer.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) resolve(true);
    });
  });
}

async function generateModelForStadium(stadium: typeof WORLD_CUP_2026_STADIUMS[0]) {
  const modelPath = path.join(PUBLIC_MODELS_DIR, `${stadium.id}.glb`);
  
  // Si ya existe el modelo, podemos omitirlo para no gastar cuota (opcional)
  if (fs.existsSync(modelPath)) {
    console.log(`[Skip] Modelo ya existe para ${stadium.id}`);
    return `${stadium.id}.glb`;
  }
    try {
      console.log(`--- Iniciando generación para: ${stadium.name} ---`);
      const imageBuffer = await downloadImageToBuffer(stadium.imageUrl);
      // Intentamos crear la tarea, con 2 reintentos en caso de 400
      let taskId: string | null = null;
      for (let attempt = 1; attempt <= 2 && !taskId; attempt++) {
        try {
          taskId = await createTripoTask(imageBuffer, `${stadium.id}.jpg`);
        } catch (e: any) {
          console.warn(`[Advertencia] Intento ${attempt} falló al crear tarea para ${stadium.name}: ${e.message}`);
          if (attempt === 2) throw e; // último intento, rethrow
        }
      }
      const modelUrl = await pollTripoTask(taskId!);
      console.log(`[Descargando GLB] Guardando en ${modelPath}`);
      await downloadModel(modelUrl, modelPath);
      console.log(`[Éxito] Modelo 3D guardado para ${stadium.name}`);
      return `${stadium.id}.glb`;
    } catch (err: any) {
      console.error(`[Error] Fallo la generación para ${stadium.name}: ${err.message}`);
      // Si disponemos de un modelo placeholder, lo usamos
      const placeholderPath = path.join(__dirname, '../public/models/placeholder.glb');
      if (fs.existsSync(placeholderPath)) {
        const destPath = path.join(PUBLIC_MODELS_DIR, `${stadium.id}.glb`);
        fs.copyFileSync(placeholderPath, destPath);
        console.log(`[Info] Usando placeholder para ${stadium.name}`);
        return `${stadium.id}.glb`;
      }
      return null;
    }
}

async function main() {
  const indexData: Record<string, string> = {};
  
  console.log(`Generando modelos para ${WORLD_CUP_2026_STADIUMS.length} estadios...`);
  
  // Vamos a procesarlos secuencialmente para no saturar la API ni el límite de requests
  for (const stadium of WORLD_CUP_2026_STADIUMS) {
    const filename = await generateModelForStadium(stadium);
    if (filename) {
      indexData[stadium.id] = `/models/${filename}`;
    }
  }
  
  const indexPath = path.join(PUBLIC_MODELS_DIR, 'models-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log('¡Proceso completado! models-index.json ha sido creado.');
}

main().catch(console.error);
