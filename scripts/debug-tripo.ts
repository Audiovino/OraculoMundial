import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_TRIPO_API_KEY;
const WIKIMEDIA_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
  const url = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Estadio_Azteca1706p2.jpg';
  console.log(`[Descargando] ${url}`);
  
  const imgRes = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15000,
    headers: { 'User-Agent': WIKIMEDIA_USER_AGENT }
  });
  
  const imageBuffer = Buffer.from(imgRes.data);
  console.log(`[Imagen descargada] Tamaño: ${imageBuffer.length} bytes`);

  const form = new FormData();
  form.append('type', 'image_to_model');
  form.append('file', imageBuffer, { filename: 'test.jpg' });

  try {
    console.log(`[Enviando a Tripo3D...]`);
    const res = await axios.post('https://api.tripo3d.ai/v2/openapi/task', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${API_KEY}`
      }
    });
    console.log('Éxito:', res.data);
  } catch (err: any) {
    console.error('Error de Tripo3D:');
    if (err.response) {
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

main();
