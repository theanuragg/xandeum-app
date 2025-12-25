import { NextRequest, NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';
import { validateAPIKey } from '@/lib/api-auth';
import { env } from '@/lib/env';

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
    const cacheKey = `pnode:${id}`;

    // Try cache first
    const cachedPNode = await cache.get(cacheKey);
    if (cachedPNode) {
      return NextResponse.json(cachedPNode);
    }

    // Fetch from pRPC
    const pnode = await prpcClient.getPNodeById(id);
    if (!pnode) {
      return NextResponse.json(
        { error: 'pNode not found' },
        { status: 404 }
      );
    }

    // Save to database for historical tracking
    await db.pNode.upsert({
      where: { externalId: id },
      update: {
        name: pnode.name,
        status: pnode.status,
        uptime: pnode.uptime,
        latency: pnode.latency,
        rewards: pnode.rewards,
        xdnScore: pnode.xdnScore,
        updatedAt: new Date(),
      },
      create: {
        externalId: id,
        name: pnode.name,
        status: pnode.status,
        uptime: pnode. uptime,
        latency:  pnode.latency,
        validations: pnode.validations,
        rewards: pnode.rewards,
        location: pnode.location,
        region: pnode.region,
        lat: pnode.lat,
        lng: pnode. lng,
        storageUsed: pnode.storageUsed,
        storageCapacity:  pnode.storageCapacity,
        lastSeen: pnode.lastSeen,
        performance: pnode.performance,
        stake: pnode.stake,
        riskScore: pnode.riskScore,
        xdnScore:  pnode.xdnScore,
        registered: pnode.registered,
        isPublic: pnode.isPublic,
        rpcPort: pnode.rpcPort,
        version: pnode.version || '',
        storageUsagePercent: pnode.storageUsagePercent,
        cpuPercent: pnode.cpuPercent,
        memoryUsed: pnode.memoryUsed,
        memoryTotal: pnode.memoryTotal,
        packetsIn: pnode.packetsIn,
        packetsOut: pnode.packetsOut,
      },
    });

    // Cache the result
    await cache.set(cacheKey, pnode, env.PNODE_CACHE_TTL);

    return NextResponse.json(pnode);
  } catch (error) {
    console.error(`Get pNode ${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}