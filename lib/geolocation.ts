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
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface GeolocationService {
  name: string;
  url: (ip: string) => string;
  parseResponse: (data: any) => LocationData | null;
  timeout: number;
}

/**
 * Available geolocation services in order of preference
 */
const geolocationServices: GeolocationService[] = [
  {
    name: 'ipapi.co',
    url: (ip) => `https://ipapi.co/${ip}/json/`,
    parseResponse: (data) => {
      if (data.error) return null;
      return {
        country: data.country_name || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || 'UTC',
      };
    },
    timeout: 3000,
  },
  {
    name: 'ip-api.com',
    url: (ip) => `http://ip-api.com/json/${ip}`,
    parseResponse: (data) => {
      if (data.status === 'fail') return null;
      return {
        country: data.country || 'Unknown',
        region: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || 'UTC',
      };
    },
    timeout: 3000,
  },
  {
    name: 'ipwhois.app',
    url: (ip) => `http://ipwhois.app/json/${ip}`,
    parseResponse: (data) => {
      if (data.success === false) return null;
      return {
        country: data.country || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        timezone: data.timezone || 'UTC',
      };
    },
    timeout: 3000,
  },
];

/**
 * Try a single geolocation service with retries
 */
async function tryGeolocationService(service: GeolocationService, ip: string): Promise<LocationData | null> {
  const maxRetries = 2;
  const baseDelay = 500; // 0.5 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(service.url(ip), {
        timeout: service.timeout,
        headers: {
          'User-Agent': 'Xandeum-Dashboard/1.0',
        },
      });

      const locationData = service.parseResponse(response.data);
      if (locationData) {
        console.log(`✅ Geolocation success for ${ip} using ${service.name}`);
        return locationData;
      }

      // If parsing failed, don't retry
      return null;
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        console.warn(`❌ ${service.name} failed for ${ip}:`, error.message || error);
        return null;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  return null;
}

/**
 * Get geolocation data for an IP address with multiple service fallbacks
 */
export async function getGeolocation(ip: string): Promise<LocationData | null> {
  // Check cache first
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  // Overall timeout to prevent hanging (10 seconds total)
  return Promise.race([
    _getGeolocationWithFallbacks(ip),
    new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn(`⏰ Geolocation timeout for ${ip} after 10 seconds`);
        resolve(null);
      }, 10000);
    }),
  ]);
}

/**
 * Try multiple geolocation services in sequence
 */
async function _getGeolocationWithFallbacks(ip: string): Promise<LocationData | null> {
  for (const service of geolocationServices) {
    console.log(`🔍 Trying ${service.name} for ${ip}`);

    const result = await tryGeolocationService(service, ip);
    if (result) {
      // Cache the successful result
      geoCache.set(ip, result);
      return result;
    }
  }

  console.warn(`❌ All geolocation services failed for ${ip}`);
  return null;
}

/**
 * Clear geolocation cache
 */
export function clearGeolocationCache(): void {
  geoCache.clear();
}