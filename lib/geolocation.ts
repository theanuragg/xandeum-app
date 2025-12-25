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
    // Use ipapi.co for geolocation (free tier available)
    const response = await axios.get<any>(`http://ipapi.co/${ip}/json/`);
    
    if (response.data. error) {
      console.warn(`Geolocation error for ${ip}:`, response.data.error);
      return null;
    }

    const locationData: LocationData = {
      country: response.data.country_name || 'Unknown',
      region:  response.data.region || 'Unknown',
      city: response. data.city || 'Unknown',
      latitude: response.data.latitude || 0,
      longitude:  response.data.longitude || 0,
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