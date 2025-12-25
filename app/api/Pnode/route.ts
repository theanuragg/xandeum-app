import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { prpcClient, PNodeFilters } from '@/lib/prpc-client';
import { validateAPIKey, checkRateLimit } from '@/lib/api-auth';
import { PNode } from '@/app/generated/prisma/client';

/**
 * Convert BigInt fields to strings for JSON serialization
 */
function serializePNode(pnode: PNode): any {
  return {
    ...pnode,
    storageUsed: pnode.storageUsed.toString(),
    storageCapacity: pnode.storageCapacity.toString(),
    memoryUsed: pnode.memoryUsed.toString(),
    memoryTotal: pnode.memoryTotal.toString(),
  };
}

/**
 * Convert BigInt fields back from strings (for cache deserialization)
 */
function deserializePNode(data: any): PNode {
  return {
    ...data,
    storageUsed: BigInt(data.storageUsed),
    storageCapacity: BigInt(data.storageCapacity),
    memoryUsed: BigInt(data.memoryUsed),
    memoryTotal: BigInt(data.memoryTotal),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastSeen: new Date(data.lastSeen),
  };
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

    // Check rate limit
    const rateLimitKey = auth.apiKey || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimited = !(await checkRateLimit(rateLimitKey));
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
      location: searchParams.get('location') || undefined,
      region: searchParams.get('region') || undefined,
      page: parseInt(searchParams.get('page') || '0'),
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    const cacheKey = `pnodes:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      // Deserialize BigInt fields if coming from cache
      if (cachedData.data && Array.isArray(cachedData.data)) {
        cachedData.data = cachedData.data.map((item: any) => 
          typeof item.storageUsed === 'string' ? deserializePNode(item) : item
        );
      }
      
      // Re-serialize for JSON response
      const response = {
        ...cachedData,
        data: cachedData.data.map(serializePNode),
      };
      return NextResponse.json(response);
    }

    console.log('Cache miss, fetching from pRPC...');

    // Fetch from pRPC
    let pnodes = await prpcClient.getPNodes(filters);

    // If pRPC returns no data, try database as fallback
    if (pnodes.length === 0) {
      console.log('No data from pRPC, trying database fallback...');
      try {
        const { db } = await import('@/lib/prisma').catch(() => ({ db: null }));
        
        if (db && typeof db.pNode !== 'undefined') {
          const dbNodes = await db.pNode.findMany({
            where: {
              ...(filters.status && { status: filters.status }),
              ...(filters.location && { location: { contains: filters.location, mode: 'insensitive' } }),
              ...(filters.region && { region: { contains: filters.region, mode: 'insensitive' } }),
            },
            orderBy: { lastSeen: 'desc' },
            take: filters.limit || 100,
            skip: (filters.page || 0) * (filters.limit || 100),
          });
          
          if (dbNodes.length > 0) {
            console.log(`Found ${dbNodes.length} pNodes from database`);
            pnodes = dbNodes;
          }
        } else {
          console.log('Database not available (Prisma client not installed or not initialized)');
        }
      } catch (dbError: any) {
        console.error('Database fallback failed:', dbError?.message || dbError);
      }
    }

    // Apply filters
    let filtered = pnodes;
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.location) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.region) {
      filtered = filtered.filter(p => p.region.toLowerCase().includes(filters.region!.toLowerCase()));
    }

    // Pagination
    const start = (filters.page || 0) * (filters.limit || 100);
    const end = start + (filters.limit || 100);
    const paginated = filtered.slice(start, end);

    // Prepare response with serialized BigInt fields
    const responseData = {
      data: paginated.map(serializePNode),
      pagination: {
        page: filters.page || 0,
        limit: filters.limit || 100,
        total: filtered.length,
      },
    };

    // Cache the serialized results
    const PNODE_CACHE_TTL = process.env.PNODE_CACHE_TTL 
      ? parseInt(process.env.PNODE_CACHE_TTL, 10) 
      : 300;
    
    try {
      await cache.set(cacheKey, responseData, PNODE_CACHE_TTL);
      console.log(`Cached ${paginated.length} pNodes for ${PNODE_CACHE_TTL}s`);
    } catch (cacheError) {
      console.error('Failed to cache response:', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Get pNodes error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        data: [],
        pagination: {
          page: 0,
          limit: 100,
          total: 0,
        }
      },
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

    console.log('Cache cleared successfully');

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