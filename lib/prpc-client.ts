import { PNode, Prisma } from '@/app/generated/prisma/client';
import { PrpcClient, Pod, PodsResponse, NodeStats } from 'xandeum-prpc';
import { getGeolocation } from './geolocation';

// Map Xandeum Pod data to our internal format
interface PRPCPNodeData {
  id: string;
  name: string;
  status: string;
  uptime: number;
  latency: number;
  stake: number;
  rewards: number;
  isPublic: boolean;
  rpcPort: number;
  version: string;
  cpuPercent: number;
  memoryUsed: number;
  memoryTotal: number;
  packetsIn: number;
  packetsOut: number;
  storageUsed: number;
  storageCapacity: number;
}

export interface PNodeFilters {
  status?: string;
  location?: string;
  region?: string;
  page?: number;
  limit?: number;
}

/**
 * Calculates the Xandeum Node Score
 */
function calculateXDNScore(stake: number, uptime: number, latency: number, riskScore: number): number {
  let latencyScore = 100 - latency;
  if (latencyScore < 0) latencyScore = 0;

  let riskScoreNormalized = 100 - riskScore;
  if (riskScoreNormalized < 0) riskScoreNormalized = 0;

  return (stake * 0.4) + (uptime * 0.3) + (latencyScore * 0.2) + (riskScoreNormalized * 0.1);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class PRPCClient {
  private seedIPs: string[];
  private timeout: number;
  private maxRetries: number;

  constructor() {
    const envSeeds = process.env.PRPC_SEED_IPS;
    this.seedIPs = envSeeds 
      ? envSeeds.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0)
      : PrpcClient.defaultSeedIps;
    
    // Parse timeout with validation - default to 15 seconds
    const timeoutEnv = process.env.PRPC_TIMEOUT || '15000';
    this.timeout = parseInt(timeoutEnv, 10);
    
    // Validate timeout is reasonable (min 5 seconds, max 60 seconds)
    if (isNaN(this.timeout) || this.timeout < 5000) {
      console.warn(`Invalid PRPC_TIMEOUT value: ${timeoutEnv}, using default 15000ms`);
      this.timeout = 15000;
    } else if (this.timeout > 60000) {
      console.warn(`PRPC_TIMEOUT too large: ${this.timeout}ms, capping at 60000ms`);
      this.timeout = 60000;
    }
    
    this.maxRetries = parseInt(process.env.PRPC_MAX_RETRIES || '2', 10);
    
    if (this.seedIPs.length === 0) {
      console.warn('No seed IPs configured! Using default seed IPs from xandeum-prpc');
      this.seedIPs = PrpcClient.defaultSeedIps;
    }
    
    console.log(`PRPCClient initialized with ${this.seedIPs.length} seed IPs:`, this.seedIPs.slice(0, 3).join(', '), '...');
    console.log(`Timeout: ${this.timeout}ms, Max retries: ${this.maxRetries}`);
  }

  /**
   * Query a single seed with retry logic and exponential backoff
   */
  private async querySeedWithRetry(seedIp: string): Promise<PodsResponse | null> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Seed ${seedIp}: Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms delay`);
          await sleep(delay);
        }

        const client = new PrpcClient(seedIp, { timeout: this.timeout });
        
        // Try getPods() first
        try {
          console.log(`[${new Date().toISOString()}] Seed ${seedIp}: Attempt ${attempt + 1} - Calling getPods()...`);
          const podsResponse = await client.getPods();
          console.log(`Seed ${seedIp}: getPods() succeeded - ${podsResponse.pods?.length || 0} pods`);
          
          // If we got pods, try to enhance with stats
          if (podsResponse.pods && podsResponse.pods.length > 0) {
            try {
              const podsWithStats = await client.getPodsWithStats();
              console.log(`Seed ${seedIp}: Enhanced with stats`);
              return podsWithStats;
            } catch {
              return podsResponse;
            }
          }
          return podsResponse;
        } catch (error: any) {
          // Fallback to getPodsWithStats
          console.log(`Seed ${seedIp}: getPods() failed, trying getPodsWithStats()...`);
          const podsResponse = await client.getPodsWithStats();
          console.log(`Seed ${seedIp}: getPodsWithStats() succeeded - ${podsResponse.pods?.length || 0} pods`);
          return podsResponse;
        }
      } catch (error: any) {
        const isLastAttempt = attempt === this.maxRetries;
        const errorMsg = error?.message || String(error);
        
        if (isLastAttempt) {
          console.error(`Seed ${seedIp}: All ${this.maxRetries + 1} attempts failed. Last error: ${errorMsg}`);
          return null;
        } else {
          console.warn(`Seed ${seedIp}: Attempt ${attempt + 1} failed: ${errorMsg}`);
        }
      }
    }
    return null;
  }

  /**
   * Health check for pRPC connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.seedIPs.length === 0) return false;
      const client = new PrpcClient(this.seedIPs[0], { timeout: 5000 });
      await client.getStats();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch all pNodes with optional filtering
   */
  async getPNodes(filters: PNodeFilters = {}): Promise<PNode[]> {
    try {
      const allPods: Map<string, Pod> = new Map();
      
      console.log(`Querying ${this.seedIPs.length} seed nodes for pods...`);
      console.log(`Seed IPs: ${this.seedIPs.join(', ')}`);
      
      // Query all seed nodes with retry logic
      const queries = this.seedIPs.map(seedIp => this.querySeedWithRetry(seedIp));
      const results = await Promise.allSettled(queries);
      
      let successCount = 0;
      results.forEach((result, index) => {
        const seedIp = this.seedIPs[index];
        
        if (result.status === 'fulfilled' && result.value) {
          const podsResponse = result.value;
          
          if (!podsResponse.pods || !Array.isArray(podsResponse.pods)) {
            console.warn(`Seed ${seedIp}: Invalid response structure`);
            return;
          }
          
          console.log(`Seed ${seedIp}: Processing ${podsResponse.pods.length} pods`);
          
          let addedCount = 0;
          podsResponse.pods.forEach(pod => {
            if (pod.pubkey && !allPods.has(pod.pubkey)) {
              allPods.set(pod.pubkey, pod);
              addedCount++;
            }
          });
          
          if (addedCount > 0) {
            console.log(`Seed ${seedIp}: Added ${addedCount} unique pods`);
            successCount++;
          }
        } else {
          console.error(`Seed ${seedIp}: Query failed completely`);
        }
      });

      console.log(`Successfully queried ${successCount}/${this.seedIPs.length} seed nodes. Total unique pods: ${allPods.size}`);

      if (allPods.size === 0) {
        console.error('❌ No pods found from any seed nodes!');
        console.error('Possible causes:');
        console.error('  1. All seed nodes are down or unreachable');
        console.error('  2. Network/firewall blocking connections');
        console.error('  3. Seed IPs need to be updated');
        console.error('  4. Authentication or API changes');
        console.error('');
        console.error('Troubleshooting steps:');
        console.error(`  - Test connectivity: ping ${this.seedIPs[0]}`);
        console.error(`  - Check if RPC port is accessible`);
        console.error(`  - Verify PRPC_SEED_IPS environment variable`);
        console.error(`  - Review xandeum-prpc documentation for updates`);
        return [];
      }

      console.log(`Converting ${allPods.size} pods to PNode format...`);

      // Convert pods to PNode format
      const pnodePromises = Array.from(allPods.entries()).map(async ([pubkey, pod]) => {
        const nodeData: PRPCPNodeData = {
          id: pubkey,
          name: pubkey.substring(0, 8) + '...',
          status: pod.uptime && pod.uptime > 0 ? 'active' : 'inactive',
          uptime: pod.uptime || 0,
          latency: 0,
          stake: 0,
          rewards: 0,
          isPublic: pod.is_public || false,
          rpcPort: pod.rpc_port || 6000,
          version: pod.version || 'unknown',
          cpuPercent: 0,
          memoryUsed: 0,
          memoryTotal: 0,
          packetsIn: 0,
          packetsOut: 0,
          storageUsed: pod.storage_used || 0,
          storageCapacity: pod.storage_committed || pod.storage_used || 0,
        };

        // Get geolocation
        let geolocation = null;
        try {
          if (pod.address) {
            geolocation = await getGeolocation(pod.address);
          }
        } catch (error) {
          // Geolocation is optional, will fallback to Unknown
        }

        // Provide fallback location data if geolocation failed
        if (!geolocation || geolocation.country === 'Unknown') {
          geolocation = {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC'
          };
        }
        
        const riskScore = this.calculateRiskScore(nodeData);
        const xdnScore = calculateXDNScore(
          nodeData.stake,
          nodeData.uptime,
          nodeData.latency,
          riskScore
        );

        const location = (geolocation?.country && geolocation.country !== 'Unknown' && geolocation.country !== null) ? geolocation.country : 'Unknown';
        const region = (geolocation?.region && geolocation.region !== 'Unknown' && geolocation.region !== null) ? geolocation.region : 'Unknown';

        return {
          id: nodeData.id,
          externalId: nodeData.id,
          name: nodeData.name,
          status: nodeData.status,
          uptime: nodeData.uptime,
          latency: nodeData.latency,
          validations: 0,
          rewards: nodeData.rewards,
          location,
          region,
          lat: geolocation?.latitude || 0,
          lng: geolocation?.longitude || 0,
          storageUsed: BigInt(nodeData.storageUsed),
          storageCapacity: BigInt(nodeData.storageCapacity),
          lastSeen: new Date(pod.last_seen_timestamp * 1000 || Date.now()),
          performance: this.calculatePerformance(nodeData),
          stake: nodeData.stake,
          riskScore,
          xdnScore,
          registered: true,
          isPublic: nodeData.isPublic,
          rpcPort: nodeData.rpcPort,
          version: nodeData.version,
          storageUsagePercent: nodeData.storageCapacity > 0 
            ? (nodeData.storageUsed / nodeData.storageCapacity) * 100 
            : 0,
          cpuPercent: nodeData.cpuPercent,
          memoryUsed: BigInt(nodeData.memoryUsed),
          memoryTotal: BigInt(nodeData.memoryTotal),
          packetsIn: nodeData.packetsIn,
          packetsOut: nodeData.packetsOut,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      const conversionResults = await Promise.allSettled(pnodePromises);
      const convertedPnodes = conversionResults
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<PNode>).value);

      console.log(`✅ Successfully converted ${convertedPnodes.length} pods to PNode format`);
      return convertedPnodes;
    } catch (error: any) {
      console.error('❌ Critical error in getPNodes:', error);
      return [];
    }
  }

  /**
   * Fetch a single pNode by ID (pubkey)
   */
  async getPNodeById(id: string): Promise<PNode | null> {
    try {
      // Fetch all pNodes and filter for the specific ID
      // This is a workaround since PrpcClient.findPNode may not work correctly
      const allPNodes = await this.getPNodes();
      const pnode = allPNodes.find(node => node.externalId === id);

      if (!pnode) return null;

      // Since we already have the PNode data from getPNodes, return it directly
      return pnode;
    } catch (error) {
      console.error(`Failed to fetch pNode ${id}:`, error);
      return null;
    }
  }

  private calculatePerformance(node: PRPCPNodeData): number {
    const uptimeWeight = node.uptime * 0.5;
    const latencyScore = Math.max(0, 100 - node.latency) * 0.3;
    const cpuScore = (100 - node.cpuPercent) * 0.2;
    return uptimeWeight + latencyScore + cpuScore;
  }

  private calculateRiskScore(node: PRPCPNodeData): number {
    const uptimeRisk = (100 - node.uptime) * 0.4;
    const latencyRisk = Math.min(node.latency / 100, 1) * 40;
    const cpuRisk = (node.cpuPercent / 100) * 20;
    return Math.min(uptimeRisk + latencyRisk + cpuRisk, 100);
  }
}

export const prpcClient = new PRPCClient();