import { NextRequest, NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';
import { cache } from '@/lib/cache';
import { validateAPIKey } from '@/lib/api-auth';
import { env } from '@/lib/env';

interface GeoData {
  country: string;
  count: number;
  avgUptime: number;
  flag: string;
  color: string;
}

const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Canada': '🇨🇦',
  'Japan': '🇯🇵',
  'Australia': '🇦🇺',
  'India': '🇮🇳',
  'Singapore': '🇸🇬',
  'Unknown': '❓',
};

function getCountryFlag(country: string): string {
  return countryFlags[country] || '🌍';
}

function getColorForUptime(uptime: number): string {
  if (uptime >= 99.5) return '#00d084';
  if (uptime >= 99) return '#3b82f6';
  if (uptime >= 98) return '#fbbf24';
  if (uptime >= 97) return '#f97316';
  return '#ef4444';
}

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const auth = await validateAPIKey();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', code: auth.error },
        { status: 401 }
      );
    }

    const cacheKey = 'network:heatmap';

    // Try cache first
    const cachedHeatmap = await cache.get(cacheKey);
    if (cachedHeatmap) {
      return NextResponse. json(cachedHeatmap);
    }

    // Fetch all pNodes
    const pnodes = await prpcClient.getPNodes({ limit: 1000 });

    // Aggregate by country
    const geoMap = new Map<string, { count: number; totalUptime: number }>();

    for (const node of pnodes) {
      const country = node.location || 'Unknown';
      const current = geoMap.get(country) || { count: 0, totalUptime: 0 };
      current.count++;
      current.totalUptime += node. uptime;
      geoMap.set(country, current);
    }

    // Convert to response format
    const heatmap: GeoData[] = Array.from(geoMap.entries()).map(([country, data]) => ({
      country,
      count: data.count,
      avgUptime: Number((data.totalUptime / data. count).toFixed(2)),
      flag: getCountryFlag(country),
      color: getColorForUptime(data.totalUptime / data.count),
    }));

    const response = {
      heatmap:  heatmap. sort((a, b) => b.count - a.count),
      totalCountries: heatmap.length,
      totalNodes: pnodes.length,
      timestamp: Date.now(),
    };

    // Cache the results
    await cache.set(cacheKey, response, env. PNODE_CACHE_TTL);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Network heatmap error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status:  500 }
    );
  }
}