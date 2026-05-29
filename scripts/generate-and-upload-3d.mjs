/**
 * generate-and-upload-3d.mjs
 * 
 * Genera modelos 3D de los 18 estadios del Mundial 2026 usando Tripo3D API
 * y los sube a Supabase Storage para hosting permanente.
 * 
 * EJECUTAR UNA SOLA VEZ localmente:
 *   node scripts/generate-and-upload-3d.mjs
 * 
 * Los modelos quedan en Supabase Storage y el models-index.json
 * se actualiza con las URLs públicas permanentes.
 * Nunca más hace falta llamar a Tripo ni regenerar nada.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────
const TRIPO_API_KEY = 'tsk_yAIeiBHl8mp7F78McNFiUGyFJWlerirXVs6OLhIG7sC';
const SUPABASE_URL  = 'https://rthdnwkwocojijyfcrtr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aGRud2t3b2NvamlqeWZjcnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTcxNjc0MCwiZXhwIjoyMDgxMjkyNzQwfQ.0zyl50gjh4wGFCaHBeKyEwNOysldPpgkVjQc3RBW1ZM';
const BUCKET = 'stadium-models';

const PUBLIC_MODELS_DIR = path.join(__dirname, '../public/models');
const INDEX_PATH = path.join(PUBLIC_MODELS_DIR, 'models-index.json');

// ─── Estadios ─────────────────────────────────────────────────────────────────
const STADIUMS = [
  { id: 'azteca',       name: 'Estadio Azteca',          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Estadio_Azteca1706p2.jpg' },
  { id: 'guadalajara',  name: 'Estadio Akron',            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Estadio_Omnilife_Chivas.jpg' },
  { id: 'monterrey',    name: 'Estadio BBVA',             imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Estadio_BBVA_Bancomer_%281%29.jpg' },
  { id: 'kansas_city',  name: 'Arrowhead Stadium',        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Chiefs-Raiders_2021_at_Arrowhead_Stadium.png' },
  { id: 'atlanta',      name: 'Mercedes-Benz Stadium',    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg' },
  { id: 'dallas',       name: 'AT&T Stadium',             imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Cowboys_Stadium_full_view.jpg' },
  { id: 'houston',      name: 'NRG Stadium',              imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nrg_stadium.jpg/1280px-Nrg_stadium.jpg' },
  { id: 'miami',        name: 'Hard Rock Stadium',        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/1280px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg' },
  { id: 'san_francisco',name: "Levi's Stadium",           imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/1280px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg' },
  { id: 'los_angeles',  name: 'SoFi Stadium',             imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/1280px-SoFi_Stadium_2023.jpg' },
  { id: 'seattle',      name: 'Lumen Field',              imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Qwest_Field_North.jpg' },
  { id: 'denver',       name: 'Empower Field',            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Empower_Field_at_Mile_High_20241001.jpg/1280px-Empower_Field_at_Mile_High_20241001.jpg' },
  { id: 'toronto',      name: 'BMO Field',                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/BMO_Field_in_2016.png' },
  { id: 'vancouver',    name: 'BC Place',                 imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg/1280px-BC_Place_2015_Women%27s_FIFA_World_Cup.jpg' },
  { id: 'metlife',      name: 'MetLife Stadium',          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/1280px-Metlife_stadium_%28Aerial_view%29.jpg' },
  { id: 'rose_bowl',    name: 'Rose Bowl',                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg/1280px-2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg' },
  { id: 'gillette',     name: 'Gillette Stadium',         imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Gillette_Stadium%2C_Chicago_Fire_vs._New_England_Revolution_2003.jpg' },
  { id: 'lincoln',      name: 'Lincoln Financial Field',  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg' },
];

// ─── HTTP helpers (sin axios, Node nativo) ────────────────────────────────────
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://commons.wikimedia.org/'
      }
    };
    client.get(url, options, (res) => {
      // Seguir redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function postJSON(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function postMultipart(url, fileBuffer, filename, headers = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const ext = filename.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileBuffer, footer]);

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        ...headers
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers
    };
    https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    }).on('error', reject).end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Tripo API ────────────────────────────────────────────────────────────────
async function withRetry(operation, maxRetries = 5, baseDelayMs = 5000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (err) {
      if (err.message.includes('Too many requests') || err.message.toLowerCase().includes('rate limit') || err.message.includes('429')) {
        attempt++;
        const delay = baseDelayMs * attempt;
        console.warn(`\n  ⚠️  [Tripo] Rate limit hit. Esperando ${delay/1000}s (Intento ${attempt}/${maxRetries})...`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Fallo tras ${maxRetries} reintentos.`);
}

async function uploadImageToTripo(imageBuffer, filename) {
  console.log(`  [Tripo] Subiendo imagen ${filename}...`);
  return await withRetry(async () => {
    const res = await postMultipart(
      'https://api.tripo3d.ai/v2/openapi/upload',
      imageBuffer,
      filename,
      { Authorization: `Bearer ${TRIPO_API_KEY}` }
    );
    if (res.code === 0 && res.data?.image_token) return res.data.image_token;
    if (res.code === 429 || (res.message && res.message.includes('Too many requests'))) {
      throw new Error('Too many requests');
    }
    throw new Error(`Upload falló: ${JSON.stringify(res)}`);
  });
}

async function createTripoTask(imageToken, stadiumId) {
  console.log(`  [Tripo] Creando tarea image_to_model...`);
  return await withRetry(async () => {
    const res = await postJSON(
      'https://api.tripo3d.ai/v2/openapi/task',
      { type: 'image_to_model', file: { type: 'jpg', file_token: imageToken } },
      { Authorization: `Bearer ${TRIPO_API_KEY}` }
    );
    if (res.code === 0 && res.data?.task_id) return res.data.task_id;
    if (res.code === 429 || (res.message && res.message.includes('Too many requests'))) {
      throw new Error('Too many requests');
    }
    throw new Error(`Crear tarea falló: ${JSON.stringify(res)}`);
  });
}

async function pollTripoTask(taskId) {
  while (true) {
    const res = await getJSON(
      `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
      { Authorization: `Bearer ${TRIPO_API_KEY}` }
    );
    const { status, result, progress } = res.data;
    process.stdout.write(`\r  [Tripo] ${status} ${progress ?? 0}%   `);
    if (status === 'success') { console.log(''); return result.model.url; }
    if (status === 'failed' || status === 'cancelled') throw new Error(`Tarea ${status}`);
    await sleep(8000);
  }
}

// ─── Supabase Storage ─────────────────────────────────────────────────────────
async function ensureBucket() {
  // Crear bucket si no existe
  const res = await postJSON(
    `${SUPABASE_URL}/storage/v1/bucket`,
    { id: BUCKET, name: BUCKET, public: true, file_size_limit: 52428800 },
    { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY }
  );
  if (res.error && !res.error.message?.includes('already exists')) {
    console.warn(`  [Storage] Bucket: ${res.error.message}`);
  } else {
    console.log(`  [Storage] Bucket '${BUCKET}' listo.`);
  }
}

async function uploadToSupabase(fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': fileBuffer.length,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'x-upsert': 'true'
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode === 200 || res.statusCode === 201) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
          resolve(publicUrl);
        } else {
          reject(new Error(`Storage upload ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(PUBLIC_MODELS_DIR)) {
    fs.mkdirSync(PUBLIC_MODELS_DIR, { recursive: true });
  }

  // Cargar índice existente (para no regenerar lo que ya está)
  let indexData = {};
  if (fs.existsSync(INDEX_PATH)) {
    try { indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8')); } catch {}
  }

  console.log('\n🏟️  Generador de Modelos 3D — Estadios Mundial 2026');
  console.log('='.repeat(55));
  console.log(`📦 Bucket Supabase: ${BUCKET}`);
  console.log(`📋 Estadios a procesar: ${STADIUMS.length}`);
  
  const alreadyDone = STADIUMS.filter(s => indexData[s.id]?.startsWith('http'));
  console.log(`✅ Ya generados: ${alreadyDone.length}`);
  console.log(`⏳ Pendientes: ${STADIUMS.length - alreadyDone.length}\n`);

  await ensureBucket();

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const stadium of STADIUMS) {
    // Si ya tiene URL de Supabase en el índice, saltar
    if (indexData[stadium.id]?.startsWith('http')) {
      console.log(`⏭️  [${stadium.id}] Ya existe en Supabase — skip`);
      skipCount++;
      continue;
    }

    console.log(`\n🔄 Procesando: ${stadium.name} (${stadium.id})`);
    const localPath = path.join(PUBLIC_MODELS_DIR, `${stadium.id}.glb`);

    try {
      let glbBuffer;

      // Si el GLB ya está en disco local, usarlo directamente
      if (fs.existsSync(localPath)) {
        console.log(`  [Local] GLB encontrado en disco, subiendo a Supabase...`);
        glbBuffer = fs.readFileSync(localPath);
      } else {
        // 1. Descargar imagen del estadio
        console.log(`  [Imagen] Descargando desde Wikimedia...`);
        const imageBuffer = await fetchBuffer(stadium.imageUrl);
        console.log(`  [Imagen] OK — ${(imageBuffer.length / 1024).toFixed(0)} KB`);

        // 2. Subir imagen a Tripo y crear tarea
        const ext = stadium.imageUrl.includes('.png') ? 'png' : 'jpg';
        const imageToken = await uploadImageToTripo(imageBuffer, `${stadium.id}.${ext}`);
        const taskId = await createTripoTask(imageToken, stadium.id);
        console.log(`  [Tripo] Task ID: ${taskId}`);

        // 3. Esperar resultado
        const modelUrl = await pollTripoTask(taskId);
        console.log(`  [Tripo] Modelo listo: ${modelUrl.substring(0, 60)}...`);

        // 4. Descargar GLB
        console.log(`  [GLB] Descargando modelo...`);
        glbBuffer = await fetchBuffer(modelUrl);
        console.log(`  [GLB] OK — ${(glbBuffer.length / 1024 / 1024).toFixed(2)} MB`);

        // Guardar copia local (por si acaso)
        fs.writeFileSync(localPath, glbBuffer);
        console.log(`  [Local] Guardado en ${localPath}`);
      }

      // 5. Subir a Supabase Storage
      console.log(`  [Supabase] Subiendo a Storage...`);
      const publicUrl = await uploadToSupabase(glbBuffer, `${stadium.id}.glb`);
      console.log(`  [Supabase] ✅ URL: ${publicUrl}`);

      // 6. Actualizar índice
      indexData[stadium.id] = publicUrl;
      fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2), 'utf-8');
      console.log(`  [Index] models-index.json actualizado`);

      successCount++;

      // Pausa entre estadios para no saturar Tripo
      if (successCount < STADIUMS.length - skipCount) {
        console.log(`  ⏸️  Pausa 3s antes del siguiente...`);
        await sleep(3000);
      }

    } catch (err) {
      console.error(`  ❌ Error en ${stadium.name}: ${err.message}`);
      errorCount++;
      // Continuar con el siguiente
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log(`✅ Generados: ${successCount}`);
  console.log(`⏭️  Saltados (ya existían): ${skipCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`\n📄 models-index.json actualizado con ${Object.keys(indexData).length} entradas`);
  console.log('\n🎉 Listo. Los modelos están en Supabase Storage.');
  console.log('   Commitea el models-index.json actualizado al repo.');
  console.log('   Nunca más hace falta llamar a Tripo.\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
