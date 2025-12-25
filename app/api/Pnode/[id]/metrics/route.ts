import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { validateAPIKey } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate API key
    const auth = await validateAPIKey();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', code: auth.error },
        { status: 401 }
      );
    }

    const { id } = params;
    const cacheKey = `pnode:${id}:metrics`;

    // Try cache first
    const cachedMetrics = await cache.get(cacheKey);
    if (cachedMetrics) {
      return NextResponse.json(cachedMetrics);
    }

    // Fetch metrics from database
    const metrics = await db.pNodeMetric.findMany({
      where: { pnodeId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (metrics.length === 0) {
      return NextResponse.json(
        { error: 'No metrics found for this pNode' },
        { status: 404 }
      );
    }

    // Cache the results (default 300 seconds if not set)
    const PNODE_CACHE_TTL = process.env.PNODE_CACHE_TTL 
      ? parseInt(process.env.PNODE_CACHE_TTL, 10) 
      : 300;
    await cache.set(cacheKey, metrics, PNODE_CACHE_TTL);

    return NextResponse.json({
      pnodeId: id,
      metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error(`Get pNode metrics error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}