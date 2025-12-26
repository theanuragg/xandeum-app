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
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const cacheKey = `pnode:${id}:history:${days}d`;

    // Try cache first
    const cachedHistory = await cache.get(cacheKey);
    if (cachedHistory) {
      return NextResponse.json(cachedHistory);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch historical data
    const history = await db?.pNodeHistory.findMany({
      where: {
        pnodeId: id,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    const response = {
      pnodeId: id,
      period: `${days} days`,
      history,
      count: history?.length,
    };

    // Cache the results (default 300 seconds if not set)
    const HISTORY_CACHE_TTL = process.env.HISTORY_CACHE_TTL 
      ? parseInt(process.env.HISTORY_CACHE_TTL, 10) 
      : 300;
    await cache.set(cacheKey, response, HISTORY_CACHE_TTL);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Get pNode history error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}