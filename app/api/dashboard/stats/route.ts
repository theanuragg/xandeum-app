import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { prpcClient } from '@/lib/prpc-client';
import { validateAPIKey, checkRateLimit } from '@/lib/api-auth';

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

    const cacheKey = 'dashboard: stats';
    
    // Try to get from cache
    const cachedStats = await cache.get(cacheKey);
    if (cachedStats) {
      return NextResponse.json(cachedStats);
    }

    const startTime = Date.now();

    // Fetch pNodes
    const pnodes = await prpcClient.getPNodes({ limit: 1000 });

    // Calculate statistics
    const totalNodes = pnodes.length;
    const activeNodes = pnodes.filter(p => p.status === 'active').length;
    const totalLatency = pnodes.reduce((sum, p) => sum + p.latency, 0);
    const averageLatency = totalNodes > 0 ? totalLatency / totalNodes : 0;
    const totalRewards = pnodes.reduce((sum, p) => sum + p.rewards, 0);

    // Calculate network health (0-100)
    const networkHealth = Math.min(
      ((activeNodes / totalNodes) * 80) + // 80% weight to active nodes
      Math.max(0, (100 - averageLatency) * 0.2), // 20% weight to latency
      100
    );

    const stats = {
      totalNodes,
      activeNodes,
      networkHealth:  Number(networkHealth. toFixed(2)),
      totalRewards:  Number(totalRewards.toFixed(2)),
      averageLatency: Number(averageLatency. toFixed(2)),
      validationRate: (activeNodes / totalNodes) * 100,
      fetchTime: (Date.now() - startTime) / 1000,
      timestamp: Date.now(),
    };

    // Cache the results (default 300 seconds if not set)
    const STATS_CACHE_TTL = process.env.STATS_CACHE_TTL 
      ? parseInt(process.env.STATS_CACHE_TTL, 10) 
      : 300;
    await cache.set(cacheKey, stats, STATS_CACHE_TTL);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}