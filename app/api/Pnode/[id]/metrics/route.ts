import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { validateAPIKey } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params to get the id
    const { id } = await params;
    const cacheKey = `pnode:${id}:metrics`;

    // Try cache first
    const cachedMetrics = await cache.get(cacheKey);
    if (cachedMetrics) {
      return NextResponse.json(cachedMetrics);
    }

    // Fetch metrics from database
    const metrics = await db?.pNodeMetric.findMany({
      where: { pnodeId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const response = {
      pnodeId: id,
      metrics,
      count: metrics?.length,
    };
    
    // Cache the results (default 300 seconds if not set)
    const PNODE_CACHE_TTL = process.env.PNODE_CACHE_TTL 
      ? parseInt(process.env.PNODE_CACHE_TTL, 10) 
      : 300;
    await cache.set(cacheKey, response, PNODE_CACHE_TTL);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Get pNode metrics error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}