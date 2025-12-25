import { NextRequest, NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';
import { cache } from '@/lib/cache';
import { validateAPIKey } from '@/lib/api-auth';

// Ensure BigInt serialization is enabled
import '@/lib/bigint-json';

/**
 * Serialize PNode for JSON response
 */
function serializePNode(node: any) {
  return {
    ...node,
    storageUsed: node.storageUsed.toString(),
    storageCapacity: node.storageCapacity.toString(),
    memoryUsed: node.memoryUsed.toString(),
    memoryTotal: node.memoryTotal.toString(),
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sortBy') || 'xdnScore';

    const cacheKey = `leaderboard:${sortBy}:${limit}`;

    // Try cache first
    const cachedLeaderboard = await cache.get(cacheKey);
    if (cachedLeaderboard) {
      console.log(`Cache hit for leaderboard: ${cacheKey}`);
      return NextResponse.json(cachedLeaderboard);
    }

    console.log('Cache miss, fetching leaderboard from pRPC...');

    // Fetch all pNodes
    const pnodes = await prpcClient.getPNodes({ limit: 1000 });

    if (pnodes.length === 0) {
      return NextResponse.json({
        leaderboard: [],
        count: 0,
        sortedBy: sortBy,
        timestamp: Date.now(),
      });
    }

    // Sort based on parameter
    const sorted = pnodes.sort((a, b) => {
      switch (sortBy) {
        case 'uptime':
          return b.uptime - a.uptime;
        case 'latency':
          return a.latency - b.latency;
        case 'rewards':
          return b.rewards - a.rewards;
        case 'stake':
          return b.stake - a.stake;
        case 'performance':
          return b.performance - a.performance;
        case 'xdnScore':
        default:
          return b.xdnScore - a.xdnScore;
      }
    });

    // Take top N and add rank
    const leaderboard = sorted.slice(0, limit).map((node, index) => ({
      rank: index + 1,
      ...serializePNode(node),
    }));

    const response = {
      leaderboard,
      count: leaderboard.length,
      sortedBy: sortBy,
      timestamp: Date.now(),
    };

    // Cache the results
    const PNODE_CACHE_TTL = process.env.PNODE_CACHE_TTL 
      ? parseInt(process.env.PNODE_CACHE_TTL, 10) 
      : 300;
    
    try {
      await cache.set(cacheKey, response, PNODE_CACHE_TTL);
      console.log(`Cached leaderboard (${leaderboard.length} nodes) for ${PNODE_CACHE_TTL}s`);
    } catch (cacheError) {
      console.error('Failed to cache leaderboard:', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        leaderboard: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}