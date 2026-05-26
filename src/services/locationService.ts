import { mundialSupabase } from './mundialSupabaseClient';
import { getBestLocation, getGoogleMapsAddress } from '../utils/locationDetector';
import { identifyLeadBuilding } from './hermesAgents';

export interface CapturedLocation {
  userId: string;
  latitude: number;
  longitude: number;
  source: string;
  address: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  ip?: string | null;
  isp?: string | null;
  detectedBuilding?: string | null;
  lastLocationAt: string;
}

export async function captureUserLocation(userId: string, useBrowserGeolocation: boolean = false): Promise<CapturedLocation | null> {
  const { ipLocation, browserLocation } = await getBestLocation(useBrowserGeolocation);
  const location = browserLocation || ipLocation;
  if (!location) return null;

  const latitude = location.latitude;
  const longitude = location.longitude;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  const address = getGoogleMapsAddress(location);
  let detectedBuilding: string | null = null;

  try {
    const building = await identifyLeadBuilding(latitude, longitude);
    detectedBuilding = building?.buildingName ?? null;
  } catch (error) {
    detectedBuilding = null;
  }

  const lastLocationAt = new Date().toISOString();
  const updatePayload = {
    id: userId,
    user_id: userId,
    latitude,
    longitude,
    location_source: location.source,
    location_address: address,
    location_city: (location as any).city ?? null,
    location_region: (location as any).region ?? null,
    location_country: (location as any).country ?? null,
    location_ip: (location as any).ip ?? null,
    location_isp: (location as any).isp ?? null,
    detected_building: detectedBuilding ?? 'Zona Pendiente',
    last_location_at: lastLocationAt
  };

  const { error } = await mundialSupabase
    .from('mundial_users')
    .upsert([updatePayload], { onConflict: 'id' });

  if (error) {
    throw error;
  }

  return {
    userId,
    latitude,
    longitude,
    source: location.source,
    address,
    city: (location as any).city ?? null,
    region: (location as any).region ?? null,
    country: (location as any).country ?? null,
    ip: (location as any).ip ?? null,
    isp: (location as any).isp ?? null,
    detectedBuilding: detectedBuilding ?? null,
    lastLocationAt
  };
}
