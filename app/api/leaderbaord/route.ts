import { NextRequest, NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';
import { cache } from '@/lib/cache';
import { validateAPIKey } from '@/lib/api-auth';
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sortBy') || 'xdnScore';

    const cacheKey = `leaderboard:${sortBy}: ${limit}`;

    // Try cache first
    const cachedLeaderboard = await cache.get(cacheKey);
    if (cachedLeaderboard) {
      return NextResponse.json(cachedLeaderboard);
    }

    // Fetch all pNodes
    const pnodes = await prpcClient.getPNodes({ limit: 1000 });

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
        case 'xdnScore':
        default:
          return b.xdnScore - a.xdnScore;
      }
    });

    const leaderboard = sorted.slice(0, limit).map((node, index) => ({
      rank: index + 1,
      ... node,
    }));

    const response = {
      leaderboard,
      count: leaderboard.length,
      sortedBy:  sortBy,
      timestamp: Date.now(),
    };

    // Cache the results
    await cache.set(cacheKey, response, env.PNODE_CACHE_TTL);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status:  500 }
    );
  }
}