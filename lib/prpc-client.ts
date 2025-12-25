import { PNode, Prisma } from '@/app/generated/prisma/client';
import axios, { AxiosInstance } from 'axios';
import { env } from './env';
import { getGeolocation } from './geolocation';

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
  page?:  number;
  limit?: number;
}

/**
 * Calculates the Xandeum Node Score
 * Formula: (stake * 0.4) + (uptime * 0.3) + ((100 - latency) * 0.2) + ((100 - riskScore) * 0.1)
 */
function calculateXDNScore(stake: number, uptime:  number, latency: number, riskScore: number): number {
  let latencyScore = 100 - latency;
  if (latencyScore < 0) latencyScore = 0;

  let riskScoreNormalized = 100 - riskScore;
  if (riskScoreNormalized < 0) riskScoreNormalized = 0;

  return (stake * 0.4) + (uptime * 0.3) + (latencyScore * 0.2) + (riskScoreNormalized * 0.1);
}

export class PRPCClient {
  private client: AxiosInstance;
  private seedIPs: string[];

  constructor() {
    this.seedIPs = env.PRPC_SEED_IPS;
    this.client = axios. create({
      baseURL: env.PRPC_ENDPOINT,
      timeout: 10000,
    });
  }

  /**
   * Health check for pRPC connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 10));
      return true;
    } catch (error) {
      console.error('pRPC health check failed:', error);
      return false;
    }
  }

  /**
   * Fetch all pNodes with optional filtering
   */
  async getPNodes(filters: PNodeFilters = {}): Promise<PNode[]> {
    try {
      const limit = filters.limit || 1000;
      const page = filters.page || 0;

      // Mock data for demonstration - In production, call actual pRPC endpoint
      const mockPNodes: PRPCPNodeData[] = await this.fetchFromPRPC('/pnodes', {
        limit,
        offset: page * limit,
      });

      const pnodes:  PNode[] = [];

      for (const nodeData of mockPNodes) {
        // Get geolocation
        const geolocation = await getGeolocation(nodeData.id);
        
        const riskScore = this.calculateRiskScore(nodeData);
        const xdnScore = calculateXDNScore(
          nodeData.stake,
          nodeData.uptime,
          nodeData.latency,
          riskScore
        );

        pnodes.push({
          id: nodeData.id,
          externalId: nodeData.id,
          name: nodeData.name,
          status: nodeData. status,
          uptime: nodeData.uptime,
          latency: nodeData.latency,
          validations: 0,
          rewards: nodeData.rewards,
          location: geolocation?. country || 'Unknown',
          region:  geolocation?.region || 'Unknown',
          lat: geolocation?.latitude || 0,
          lng:  geolocation?.longitude || 0,
          storageUsed:  BigInt(nodeData.storageUsed),
          storageCapacity: BigInt(nodeData.storageCapacity),
          lastSeen: new Date(),
          performance: this.calculatePerformance(nodeData),
          stake: nodeData. stake,
          riskScore,
          xdnScore,
          registered: true,
          isPublic: nodeData.isPublic,
          rpcPort: nodeData.rpcPort,
          version: nodeData.version,
          storageUsagePercent: (nodeData.storageUsed / nodeData.storageCapacity) * 100,
          cpuPercent: nodeData.cpuPercent,
          memoryUsed: BigInt(nodeData.memoryUsed),
          memoryTotal:  BigInt(nodeData.memoryTotal),
          packetsIn:  nodeData.packetsIn,
          packetsOut: nodeData.packetsOut,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return pnodes;
    } catch (error) {
      console.error('Failed to fetch pNodes:', error);
      throw error;
    }
  }

  /**
   * Fetch a single pNode by ID
   */
  async getPNodeById(id: string): Promise<PNode | null> {
    try {
      const nodeData:  PRPCPNodeData = await this.fetchFromPRPC(`/pnodes/${id}`);
      if (!nodeData) return null;

      const geolocation = await getGeolocation(id);
      const riskScore = this.calculateRiskScore(nodeData);
      const xdnScore = calculateXDNScore(
        nodeData.stake,
        nodeData.uptime,
        nodeData.latency,
        riskScore
      );

      return {
        id: nodeData.id,
        externalId: nodeData.id,
        name: nodeData.name,
        status: nodeData.status,
        uptime: nodeData.uptime,
        latency: nodeData.latency,
        validations: 0,
        rewards: nodeData.rewards,
        location: geolocation?. country || 'Unknown',
        region: geolocation?.region || 'Unknown',
        lat:  geolocation?.latitude || 0,
        lng: geolocation?.longitude || 0,
        storageUsed: BigInt(nodeData.storageUsed),
        storageCapacity: BigInt(nodeData.storageCapacity),
        lastSeen: new Date(),
        performance: this.calculatePerformance(nodeData),
        stake: nodeData. stake,
        riskScore,
        xdnScore,
        registered: true,
        isPublic: nodeData.isPublic,
        rpcPort:  nodeData.rpcPort,
        version: nodeData.version,
        storageUsagePercent: (nodeData.storageUsed / nodeData.storageCapacity) * 100,
        cpuPercent: nodeData. cpuPercent,
        memoryUsed: BigInt(nodeData.memoryUsed),
        memoryTotal: BigInt(nodeData.memoryTotal),
        packetsIn: nodeData. packetsIn,
        packetsOut: nodeData.packetsOut,
        createdAt: new Date(),
        updatedAt:  new Date(),
      };
    } catch (error) {
      console.error(`Failed to fetch pNode ${id}:`, error);
      return null;
    }
  }

  /**
   * Calculate performance score based on node metrics
   */
  private calculatePerformance(node: PRPCPNodeData): number {
    const uptimeWeight = node.uptime * 0.5;
    const latencyScore = Math.max(0, 100 - node.latency) * 0.3;
    const cpuScore = (100 - node.cpuPercent) * 0.2;

    return uptimeWeight + latencyScore + cpuScore;
  }

  /**
   * Calculate risk score based on node metrics
   */
  private calculateRiskScore(node: PRPCPNodeData): number {
    const uptimeRisk = (100 - node.uptime) * 0.4;
    const latencyRisk = Math.min(node.latency / 100, 1) * 40;
    const cpuRisk = (node.cpuPercent / 100) * 20;

    return Math.min(uptimeRisk + latencyRisk + cpuRisk, 100);
  }

  /**
   * Helper method to fetch data from pRPC endpoint
   */
  private async fetchFromPRPC(path: string, params?:  Record<string, any>): Promise<any> {
    try {
      const response = await this.client.get(path, { params });
      return response.data;
    } catch (error) {
      console.error(`pRPC request failed:  ${path}`, error);
      throw error;
    }
  }
}

export const prpcClient = new PRPCClient();