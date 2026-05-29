export interface IpLocationResult {
  source: 'ipapi' | 'ip-api' | 'unknown';
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  ip?: string;
  accuracy?: 'low' | 'medium';
  raw?: any;
}

export interface BrowserLocationResult {
  source: 'browser';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

function parseIpapiResponse(body: any): IpLocationResult {
  return {
    source: 'ipapi',
    country: body.country_name || body.country,
    region: body.region || body.region_code,
    city: body.city,
    latitude: Number(body.latitude ?? body.lat),
    longitude: Number(body.longitude ?? body.lon),
    ip: body.ip,
    isp: body.org ?? body.isp,
    accuracy: 'medium',
    raw: body
  };
}

function parseIpApiResponse(body: any): IpLocationResult {
  return {
    source: 'ip-api',
    country: body.country,
    region: body.regionName || body.region,
    city: body.city,
    latitude: Number(body.lat),
    longitude: Number(body.lon),
    isp: body.isp,
    ip: body.query,
    accuracy: 'medium',
    raw: body
  };
}

export async function getIpLocation(): Promise<IpLocationResult | null> {
  // 1. Intentar nuestro proxy serverless (sin CORS en mobile)
  try {
    const response = await fetch('/api/location', { cache: 'no-store' });
    if (response.ok) {
      const body = await response.json();
      if (body.source !== 'unknown' && body.latitude != null) {
        return {
          source: body.source === 'ipapi' ? 'ipapi' : 'ip-api',
          country: body.country ?? undefined,
          region: body.region ?? undefined,
          city: body.city ?? undefined,
          latitude: body.latitude,
          longitude: body.longitude,
          ip: body.ip ?? undefined,
          isp: body.isp ?? undefined,
          accuracy: 'medium',
          raw: body
        };
      }
    }
  } catch (_) {
    // Si el proxy falla, continuar con los fallbacks directos
  }

  // 2. Fallback directo (funciona en dev local)
  const endpoints = [
    {
      url: 'https://ipapi.co/json/',
      parser: parseIpapiResponse
    },
    {
      url: 'https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,isp,query',
      parser: parseIpApiResponse
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { cache: 'no-store' });
      if (!response.ok) continue;

      const body = await response.json();
      if (endpoint.url.includes('ip-api.com')) {
        if (body.status !== 'success') continue;
      }

      return endpoint.parser(body);
    } catch (error) {
      continue;
    }
  }

  return {
    source: 'unknown',
    raw: null
  };
}

export async function getBrowserGeolocation(options?: PositionOptions): Promise<BrowserLocationResult> {
  if (!navigator.geolocation) {
    throw new Error('Geolocalización de navegador no soportada.');
  }

  return new Promise<BrowserLocationResult>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          source: 'browser',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(new Error(error.message || `Geolocation error ${error.code}`));
      },
      options
    );
  });
}

export function getGoogleMapsAddress(location: IpLocationResult | BrowserLocationResult | null): string | null {
  if (!location) return null;

  if (location.source === 'browser') {
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    }
    return null;
  }

  const addressParts = [location.city, location.region, location.country].filter(Boolean) as string[];
  if (addressParts.length > 0) {
    const query = encodeURIComponent(addressParts.join(', '));
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  return null;
}

export async function getBestLocation(useBrowserGeolocation: boolean = false): Promise<{
  ipLocation: IpLocationResult | null;
  browserLocation: BrowserLocationResult | null;
}> {
  const ipLocation = await getIpLocation();
  let browserLocation: BrowserLocationResult | null = null;

  if (useBrowserGeolocation) {
    try {
      browserLocation = await getBrowserGeolocation();
    } catch (error) {
      browserLocation = null;
    }
  }

  return { ipLocation, browserLocation };
}
