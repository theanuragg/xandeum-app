'use client';

import useSWR from 'swr';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Fetcher function for API calls
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Dashboard APIs
export function useDashboardStats() {
  return useSWR(`${API_BASE}/api/dashboard/stats`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });
}

export function useLeaderboard(limit = 100, sortBy = 'xdnScore') {
  return useSWR(`${API_BASE}/api/leaderboard?limit=${limit}&sortBy=${sortBy}`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  });
}

export function useAllPNodes() {
  return useSWR(`${API_BASE}/api/Pnode`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
}

export function usePNodeById(id: string) {
  return useSWR(id ? `${API_BASE}/api/Pnode/${id}` : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function usePNodeHistory(id: string) {
  return useSWR(id ? `${API_BASE}/api/Pnode/${id}/history` : null, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
}

export function usePNodeAlerts(id: string) {
  return useSWR(id ? `${API_BASE}/api/Pnode/${id}/alerts` : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function usePNodeMetrics(id: string) {
  return useSWR(id ? `${API_BASE}/api/Pnode/${id}/metrics` : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function useNetworkHeatmap() {
  return useSWR(`${API_BASE}/api/network/heatmap`, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true,
  });
}

// Health check
export function useHealth() {
  return useSWR(`${API_BASE}/api/health`, fetcher, {
    refreshInterval: 60000,
  });
}

// Types for API responses
export interface PNode {
  id: string;
  externalId: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  uptime: number;
  latency: number;
  validations: number;
  rewards: number;
  location: string;
  region: string;
  lat: number;
  lng: number;
  storageUsed: string;
  storageCapacity: string;
  lastSeen: string;
  performance: number;
  stake: number;
  riskScore: number;
  xdnScore: number;
  registered: boolean;
  isPublic: boolean;
  rpcPort: number;
  version: string;
  storageUsagePercent: number;
  cpuPercent: number;
  memoryUsed: string;
  memoryTotal: string;
  packetsIn: number;
  packetsOut: number;
}

export interface DashboardStats {
  totalNodes: number;
  activeNodes: number;
  networkHealth: number;
  totalRewards: number;
  averageLatency: number;
  validationRate: number;
  fetchTime: number;
  timestamp: number;
}

export interface LeaderboardResponse {
  leaderboard: (PNode & { rank: number })[];
  count: number;
  sortedBy: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  pnodeId: string;
  pnode: PNode;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  type: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface PNodeHistory {
  id: string;
  pnodeId: string;
  timestamp: string;
  latency: number;
  uptime: number;
  storageUsed: string;
  rewards: number;
  createdAt: string;
}

export interface PNodeMetric {
  id: string;
  pnodeId: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  networkLatency: number;
  bandwidthUsed: string;
  diskReadOps: number;
  diskWriteOps: number;
  createdAt: string;
}
