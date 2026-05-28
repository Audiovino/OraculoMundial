// api/tripo-generate.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { image, filename } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image data missing' });
  }
  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TRIPO_API_KEY not configured' });
  }
  try {
    // Tripo expects multipart/form-data with a file field "file".
    const formData = new (require('form-data'))();
    const buffer = Buffer.from(image, 'base64');
    formData.append('file', buffer, { filename: filename || 'upload.png' });
    const response = await axios.post('https://api.tripo3d.ai/v1/generate', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      },
    });
    // Assuming the response contains a field `modelUrl` with the GLB URL.
    const modelUrl = response.data?.modelUrl || response.data?.url;
    return res.status(200).json({ modelUrl });
  } catch (err) {
    console.error('Tripo API error', err);
    return res.status(500).json({ error: 'Failed to generate model' });
  }
};
