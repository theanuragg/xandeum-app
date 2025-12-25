import { NextRequest, NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';
import { cache } from '@/lib/cache';
import { db, isDatabaseAvailable } from '@/lib/prisma';
import { validateAPIKey } from '@/lib/api-auth';

// Ensure BigInt serialization
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
      console.log(`Cache hit for pNode: ${id}`);
      return NextResponse.json(cachedPNode);
    }

    console.log(`Cache miss, fetching pNode ${id} from pRPC...`);

    // Fetch from pRPC
    const pnode = await prpcClient.getPNodeById(id);
    if (!pnode) {
      return NextResponse.json(
        { error: 'pNode not found' },
        { status: 404 }
      );
    }

    // Save to database for historical tracking (only if database is available)
    if (isDatabaseAvailable() && db) {
      try {
        await db.pNode.upsert({
          where: { externalId: id },
          update: {
            name: pnode.name,
            status: pnode.status,
            uptime: pnode.uptime,
            latency: pnode.latency,
            rewards: pnode.rewards,
            xdnScore: pnode.xdnScore,
            performance: pnode.performance,
            riskScore: pnode.riskScore,
            lastSeen: pnode.lastSeen,
            storageUsed: pnode.storageUsed,
            storageCapacity: pnode.storageCapacity,
            storageUsagePercent: pnode.storageUsagePercent,
            cpuPercent: pnode.cpuPercent,
            memoryUsed: pnode.memoryUsed,
            memoryTotal: pnode.memoryTotal,
            packetsIn: pnode.packetsIn,
            packetsOut: pnode.packetsOut,
            updatedAt: new Date(),
          },
          create: {
            externalId: id,
            name: pnode.name,
            status: pnode.status,
            uptime: pnode.uptime,
            latency: pnode.latency,
            validations: pnode.validations,
            rewards: pnode.rewards,
            location: pnode.location,
            region: pnode.region,
            lat: pnode.lat,
            lng: pnode.lng,
            storageUsed: pnode.storageUsed,
            storageCapacity: pnode.storageCapacity,
            lastSeen: pnode.lastSeen,
            performance: pnode.performance,
            stake: pnode.stake,
            riskScore: pnode.riskScore,
            xdnScore: pnode.xdnScore,
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
        console.log(`Saved pNode ${id} to database`);
      } catch (dbError: any) {
        console.error(`Failed to save pNode ${id} to database:`, dbError.message);
        // Continue even if database save fails
      }
    } else {
      console.log('Database unavailable, skipping pNode save');
    }

    // Serialize for JSON response
    const serializedPNode = serializePNode(pnode);

    // Cache the result
    const PNODE_CACHE_TTL = process.env.PNODE_CACHE_TTL 
      ? parseInt(process.env.PNODE_CACHE_TTL, 10) 
      : 300;
    
    try {
      await cache.set(cacheKey, serializedPNode, PNODE_CACHE_TTL);
      console.log(`Cached pNode ${id} for ${PNODE_CACHE_TTL}s`);
    } catch (cacheError) {
      console.error('Failed to cache pNode:', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(serializedPNode);
  } catch (error: any) {
    console.error(`Get pNode ${params.id} error:`, error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}