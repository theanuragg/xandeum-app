import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { prpcClient, PNodeFilters } from '@/lib/prpc-client';
import { validateAPIKey, checkRateLimit } from '@/lib/api-auth';
import { env } from '@/lib/env';

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

    // Check rate limit
    const rateLimited = !(await checkRateLimit(auth.key!));
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: PNodeFilters = {
      status: searchParams.get('status') || undefined,
      location: searchParams. get('location') || undefined,
      region: searchParams.get('region') || undefined,
      page: parseInt(searchParams.get('page') || '0'),
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    const cacheKey = `pnodes:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cachedPNodes = await cache.get(cacheKey);
    if (cachedPNodes) {
      return NextResponse.json(cachedPNodes);
    }

    // Fetch from pRPC
    const pnodes = await prpcClient.getPNodes(filters);

    // Apply filters if specified
    let filtered = pnodes;
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.location) {
      filtered = filtered.filter(p => p.location. toLowerCase().includes(filters.location! .toLowerCase()));
    }
    if (filters.region) {
      filtered = filtered.filter(p => p.region.toLowerCase().includes(filters.region!.toLowerCase()));
    }

    // Pagination
    const start = (filters.page || 0) * (filters.limit || 100);
    const end = start + (filters.limit || 100);
    const paginated = filtered.slice(start, end);

    const response = {
      data: paginated,
      pagination: {
        page: filters. page || 0,
        limit: filters.limit || 100,
        total: filtered.length,
      },
    };

    // Cache the results
    await cache.set(cacheKey, response, env.PNODE_CACHE_TTL);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get pNodes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Refresh cache for pNodes
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const auth = await validateAPIKey();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', code: auth.error },
        { status: 401 }
      );
    }

    // Clear all pNodes-related cache
    await cache.deletePattern('pnodes:*');
    await cache.delete('dashboard:stats');

    return NextResponse.json(
      { success: true, message: 'Cache refreshed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cache refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}