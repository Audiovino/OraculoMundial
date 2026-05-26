import { BrowserLocationResult, IpLocationResult } from './locationDetector';

/**
 * Obtiene una dirección legible a partir de coordenadas geográficas.
 * Prioriza el API de Google Maps si la variable de entorno `GOOGLE_MAPS_API_KEY`
 * está definida; de lo contrario, usa el servicio gratuito de Nominatim de OpenStreetMap.
 *
 * @param location Resultado de geolocalización (browser o IP).
 * @returns Cadena con la dirección formateada o `null` si falla.
 */
export async function getAddressFromCoordinates(
  location: BrowserLocationResult | IpLocationResult
): Promise<string | null> {
  const lat = 'latitude' in location ? location.latitude : location.latitude;
  const lon = 'longitude' in location ? location.longitude : location.longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  // Intentar con Google Maps si hay clave API
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].formatted_address as string;
        }
      }
    } catch (_) {
      // fall to OSM fallback
    }
  }

  // Fallback a OSM Nominatim (no API key requerida, respetar rate limits)
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    if (resp.ok) {
      const data = await resp.json();
      return data.display_name as string;
    }
  } catch (_) {}
  return null;
}
