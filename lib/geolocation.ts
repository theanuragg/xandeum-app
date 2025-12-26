import axios from 'axios';

interface LocationData {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const geoCache = new Map<string, LocationData>();

/**
 * Get geolocation data for an IP address
 */
export async function getGeolocation(ip: string): Promise<LocationData | null> {
  // Check cache first
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  try {
    // Use ip-api.com for geolocation (more reliable free tier)
    const response = await axios.get<any>(`http://ip-api.com/json/${ip}`);

    if (response.data.status === 'fail') {
      console.warn(`Geolocation failed for ${ip}:`, response.data.message);
      return null;
    }

    const locationData: LocationData = {
      country: response.data.country || 'Unknown',
      region: response.data.regionName || 'Unknown',
      city: response.data.city || 'Unknown',
      latitude: response.data.lat || 0,
      longitude: response.data.lon || 0,
      timezone: response.data.timezone || 'UTC',
    };

    // Cache the result
    geoCache.set(ip, locationData);

    return locationData;
  } catch (error) {
    console.error(`Failed to get geolocation for ${ip}:`, error);
    return null;
  }
}

/**
 * Clear geolocation cache
 */
export function clearGeolocationCache(): void {
  geoCache.clear();
}