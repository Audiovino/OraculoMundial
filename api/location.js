// api/location.js — Vercel Serverless Function
// Proxy para geolocalización IP. Evita errores CORS en mobile.

export default async function handler(req, res) {
  // Habilitar CORS para la app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Obtener la IP real del usuario (Vercel la inyecta en el header)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '';

  // No geolocalizar IPs locales
  const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.');

  if (isLocal) {
    return res.status(200).json({
      source: 'unknown',
      ip,
      city: null,
      region: null,
      country: null,
      latitude: null,
      longitude: null,
      isp: null,
      note: 'Local IP — geolocation not available'
    });
  }

  // Intentar ipapi.co primero
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'OraculoMundial/1.0' }
    });
    if (r.ok) {
      const body = await r.json();
      if (!body.error) {
        return res.status(200).json({
          source: 'ipapi',
          ip: body.ip,
          city: body.city || null,
          region: body.region || null,
          country: body.country_name || body.country || null,
          latitude: body.latitude ? Number(body.latitude) : null,
          longitude: body.longitude ? Number(body.longitude) : null,
          isp: body.org || null
        });
      }
    }
  } catch (_) {}

  // Fallback: ip-api.com
  try {
    const r = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,query`
    );
    if (r.ok) {
      const body = await r.json();
      if (body.status === 'success') {
        return res.status(200).json({
          source: 'ip-api',
          ip: body.query,
          city: body.city || null,
          region: body.regionName || null,
          country: body.country || null,
          latitude: body.lat ? Number(body.lat) : null,
          longitude: body.lon ? Number(body.lon) : null,
          isp: body.isp || null
        });
      }
    }
  } catch (_) {}

  // Sin datos
  return res.status(200).json({
    source: 'unknown',
    ip,
    city: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
    isp: null
  });
}
