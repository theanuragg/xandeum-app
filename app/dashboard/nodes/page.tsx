'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Info,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import { useLeaderboard, useDashboardStats } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PNodeStats = ({ leaderboardData, statsData }: { leaderboardData: any, statsData: any }) => {
  // Calculate version distribution from leaderboard data
  const versionData = useMemo(() => {
    if (!leaderboardData?.leaderboard) return [];

    const versionMap = new Map<string, number>();
    leaderboardData.leaderboard.forEach((node: any) => {
      const version = node.version || 'Unknown';
      versionMap.set(version, (versionMap.get(version) || 0) + 1);
    });

    const total = leaderboardData.leaderboard.length;
    const versions = Array.from(versionMap.entries())
      .map(([name, count]) => ({
        name,
        value: (count / total) * 100,
        color: name === '0.8.0' ? '#00ffd5' :
               name === 'Unknown' ? '#6b6b6b' :
               `hsl(${Math.abs(name.split('.').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 50%)`
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Add "Others" if there are more versions
    if (versionMap.size > 8) {
      const othersValue = Array.from(versionMap.entries())
        .slice(8)
        .reduce((sum, [, count]) => sum + (count / total) * 100, 0);
      versions.push({ name: 'Others', value: othersValue, color: '#5d86d6' });
    }

    return versions;
  }, [leaderboardData]);

  const totalNodes = statsData?.totalNodes || 0;
  // Use available stats data or calculate from leaderboard
  const avgPerformance = statsData?.averageLatency ?
    (100 - statsData.averageLatency) * 1000 : // Convert to performance-like metric
    (leaderboardData?.leaderboard ?
      leaderboardData.leaderboard.reduce((sum: number, node: any) => sum + (node.performance || 0), 0) / leaderboardData.leaderboard.length : 0);

  const networkHealth = statsData?.networkHealth || 0;
  const avgUptime = statsData?.validationRate ?
    statsData.validationRate * 100 : // Use validation rate as uptime proxy
    (leaderboardData?.leaderboard ?
      leaderboardData.leaderboard.reduce((sum: number, node: any) => sum + (parseFloat(node.uptime) || 0), 0) / leaderboardData.leaderboard.length : 0);

  return (
    <div
      className="card-shadow mb-8"
      style={{
        backgroundColor: "#2a2a2a",
        borderRadius: "12px",
        padding: "24px",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Total PNodes */}
        <div className="flex-1 px-4 border-r border-[#333333] mb-6 lg:mb-0">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="metric-label" style={{ fontSize: "12px", color: "#9b9b9b", textTransform: "none" }}>
                  Total PNodes
                </span>
                <Info size={12} className="text-[#6b6b6b]" />
              </div>
              <div className="metric-value">{totalNodes.toLocaleString()}</div>
            </div>
            <div className="mt-4">
              <span className="text-[11px] text-[#9b9b9b]">
                Network Health: <span className="text-[#00ffd5] font-medium ml-1">{networkHealth.toFixed(1)}%</span>
              </span>
              <Info size={11} className="inline-block ml-1 text-[#6b6b6b]" />
            </div>
          </div>
        </div>

        {/* Average Performance */}
        <div className="flex-1 px-4 border-r border-[#333333] mb-6 lg:mb-0">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="metric-label" style={{ fontSize: "12px", color: "#9b9b9b", textTransform: "none" }}>
                  Avg Performance
                </span>
                <Info size={12} className="text-[#6b6b6b]" />
              </div>
              <div className="metric-value flex items-baseline">
                {avgPerformance.toLocaleString()}<span className="text-[20px] ml-0.5"></span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[11px] text-[#9b9b9b]">
                XDN Score Range: <span className="text-[#ffffff] font-medium ml-1">0 - ∞</span>
              </span>
            </div>
          </div>
        </div>

        {/* Network Uptime */}
        <div className="flex-1 px-4 border-r border-[#333333] mb-6 lg:mb-0">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="metric-label" style={{ fontSize: "12px", color: "#9b9b9b", textTransform: "none" }}>
                  Network Uptime
                </span>
                <Info size={12} className="text-[#6b6b6b]" />
              </div>
              <div className="metric-value flex items-baseline">
                {avgUptime.toFixed(1)}<span className="text-[20px] ml-0.5">%</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[11px] text-[#9b9b9b]">
                Active Nodes: <span className="text-[#00ffd5] font-medium ml-1">{statsData?.activeNodes || 0}</span>
              </span>
            </div>
          </div>
        </div>

        {/* PNode Versions */}
        <div className="flex-[1.5] px-4">
          <div className="flex flex-row items-start justify-between">
            <div className="w-1/2">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="metric-label" style={{ fontSize: "12px", color: "#9b9b9b", textTransform: "none" }}>
                  PNode Versions
                </span>
                <Info size={12} className="text-[#6b6b6b]" />
              </div>
              <ul className="space-y-0.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {versionData.map((node, idx) => (
                  <li key={idx} className="text-[11px] text-[#ffffff] flex items-center gap-1 whitespace-nowrap">
                    <span className="font-semibold text-[#ffffff]">{node.name}</span>
                    <span className="text-[#9b9b9b]">({node.value.toFixed(1)}%)</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-1/2 flex justify-end items-center relative h-[105px]">
              <div className="w-[105px] h-[105px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={versionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={48}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {versionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-white">
                  {versionData[0]?.name || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 10px;
        }
        .metric-label {
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
    warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
    inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="w-1.5 h-1.5 mr-1.5 bg-current rounded-full"></span>
      {config.label}
    </span>
  );
};

const NodeAvatar = ({ name, avatar }: { name: string; avatar: string }) => {
  // If no avatar provided, show fallback with first letter
  if (!avatar || avatar.trim() === '') {
    return (
      <div className="w-full h-full bg-[#00ffd5] flex items-center justify-center text-[#2a2a2a] font-bold text-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-full h-full bg-[#00ffd5] flex items-center justify-center text-[#2a2a2a] font-bold text-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={avatar}
      alt={`${name} avatar`}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
    />
  );
};

export default function NodesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('xdnScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: leaderboardData, error: leaderboardError, isLoading: leaderboardLoading } = useLeaderboard(1000); // Get more nodes for accurate stats
  const { data: statsData, error: statsError, isLoading: statsLoading } = useDashboardStats();

  // Transform leaderboard data with PNode-specific fields
  const nodes = useMemo(() => {
    if (!leaderboardData?.leaderboard) return [];

    const transformed = leaderboardData.leaderboard.map((node: any, index: number) => ({
      ...node,
      rank: index + 1,
      avatar: '', // Remove DiceBear avatar usage
      version: node.version || 'Unknown',
      address: node.id,
      storageUsed: node.storageUsed ? `${(parseInt(node.storageUsed) / (1024**3)).toFixed(2)} GB` : '0 GB',
      storageCapacity: node.storageCapacity ? `${(parseInt(node.storageCapacity) / (1024**3)).toFixed(2)} GB` : '0 GB',
      storagePercentage: node.storageUsagePercent ? `${(node.storageUsagePercent * 100).toFixed(2)}%` : '0%',
      performance: node.performance ? `${node.performance.toLocaleString()}` : '0',
      uptime: node.uptime ? `${(node.uptime / 100).toFixed(1)}%` : '0%',
      xdnScore: node.xdnScore ? `${node.xdnScore.toLocaleString()}` : '0',
      status: node.status || 'unknown',
      lastSeen: node.lastSeen ? new Date(node.lastSeen).toLocaleDateString() : 'Never',
      storageUsedRaw: parseInt(node.storageUsed) || 0,
      storageCapacityRaw: parseInt(node.storageCapacity) || 0
    }));

    // Calculate total storage capacity for percentages
    const totalStorageCapacity = transformed.reduce((sum: number, node: any) => sum + node.storageCapacityRaw, 0);

    // Calculate percentages and cumulative
    let cumulativeStorage = 0;
    return transformed.map((node: any) => {
      const storagePercentage = totalStorageCapacity > 0 ? ((node.storageCapacityRaw / totalStorageCapacity) * 100) : 0;
      cumulativeStorage += storagePercentage;

      return {
        ...node,
        storageCapacityPercentage: `${storagePercentage.toFixed(2)}%`,
        cumulativeStorage: `${cumulativeStorage.toFixed(1)}%`,
        cumulativeStorageValue: cumulativeStorage
      };
    });
  }, [leaderboardData]);

  // Sort nodes based on current sort criteria
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'storage':
          aValue = a.storageCapacityRaw;
          bValue = b.storageCapacityRaw;
          break;
        case 'performance':
          aValue = parseFloat(a.performance.replace(/,/g, ''));
          bValue = parseFloat(b.performance.replace(/,/g, ''));
          break;
        case 'xdnScore':
        default:
          aValue = parseFloat(a.xdnScore.replace(/,/g, ''));
          bValue = parseFloat(b.xdnScore.replace(/,/g, ''));
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }).map((node, index) => ({ ...node, rank: index + 1 }));
  }, [nodes, sortBy, sortOrder]);

  // Filter nodes based on search
  const filteredNodes = sortedNodes.filter((node: any) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const isLoading = leaderboardLoading || statsLoading;
  const error = leaderboardError || statsError;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load nodes data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PNodes</h1>
          <p className="text-gray-800 mt-2">Monitor and compare PNode storage, performance, and network health</p>
        </div>
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search PNodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 mb-6 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* PNode Stats */}
        {!isLoading && !error && <PNodeStats leaderboardData={leaderboardData} statsData={statsData} />}

        {/* Search */}
        

        {/* Validators Table */}
        <div className="bg-[#2a2a2a] mt-6 rounded-[12px] border border-[#333333] overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#333333]">
                  <th className="py-4 px-4 table-header w-16">#</th>
                  <th className="py-4 px-4 table-header">PNode</th>
                  <th className="py-4 px-4 table-header">
                    <div className="flex items-center gap-2">
                      Storage Capacity
                      <Info className="w-3 h-3 text-[#6b6b6b]" />
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={() => handleSort('storage')}
                          className={`text-[8px] leading-3 hover:text-[#00ffd5] ${
                            sortBy === 'storage' && sortOrder === 'desc' ? 'text-[#00ffd5]' : 'text-[#9b9b9b]'
                          }`}
                        >
                          <ArrowUp size={8} />
                        </button>
                        <button
                          onClick={() => handleSort('storage')}
                          className={`text-[8px] leading-3 hover:text-[#00ffd5] ${
                            sortBy === 'storage' && sortOrder === 'asc' ? 'text-[#00ffd5]' : 'text-[#9b9b9b]'
                          }`}
                        >
                          <ArrowDown size={8} />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="py-4 px-4 table-header">
                    <div className="flex items-center gap-2">
                      Cumulative Storage
                      <Info className="w-3 h-3 text-[#6b6b6b]" />
                    </div>
                  </th>
                  <th className="py-4 px-4 table-header text-right">
                     <div className="flex items-center justify-end gap-2">
                      Performance
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={() => handleSort('performance')}
                          className={`text-[8px] leading-3 hover:text-[#00ffd5] ${
                            sortBy === 'performance' && sortOrder === 'desc' ? 'text-[#00ffd5]' : 'text-[#9b9b9b]'
                          }`}
                        >
                          <ArrowUp size={8} />
                        </button>
                        <button
                          onClick={() => handleSort('performance')}
                          className={`text-[8px] leading-3 hover:text-[#00ffd5] ${
                            sortBy === 'performance' && sortOrder === 'asc' ? 'text-[#00ffd5]' : 'text-[#9b9b9b]'
                          }`}
                        >
                          <ArrowDown size={8} />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="py-4 px-4 table-header text-center">XDN Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#222222]'}`}>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-[#333333] rounded animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#333333] rounded-full animate-pulse"></div>
                          <div className="flex flex-col gap-1">
                            <div className="h-4 bg-[#333333] rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-[#333333] rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="h-4 bg-[#333333] rounded w-20 animate-pulse"></div>
                          <div className="h-3 bg-[#333333] rounded w-16 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-2 bg-[#333333] rounded-full animate-pulse"></div>
                          <div className="h-4 bg-[#333333] rounded w-12 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-4 bg-[#333333] rounded w-12 animate-pulse ml-auto"></div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 bg-[#333333] rounded w-16 animate-pulse mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredNodes.map((node: any, i: number) => (
                    <tr
                      key={node.id}
                      className={`${i % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#222222]'} hover:bg-[#2d2d2d] transition-colors`}
                    >
                      <td className="py-4 px-4 font-semibold text-[#9b9b9b]">{node.rank}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 overflow-hidden rounded-full border border-[#333333] bg-[#2a2a2a] shrink-0">
                            <NodeAvatar name={node.name} avatar={node.avatar} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <Link
                              href={`/dashboard/node/${node.address}`}
                              className="text-[#00ffd5] font-medium hover:underline truncate"
                            >
                              {node.name}
                            </Link>
                            <span className="text-[11px] text-[#6b6b6b] mt-0.5">{node.version}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{node.storageCapacity}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[#9b9b9b] text-[11px]">Used: {node.storageUsed}</span>
                            <span className="text-[#6b6b6b] text-[11px]">({node.storagePercentage})</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5 max-w-[120px]">
                          <div className="h-2 w-full bg-[#333333] rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-[#00ffd5] rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(node.cumulativeStorageValue, 100)}%` }}
                            />
                          </div>
                          <span className="text-[13px] font-medium text-white">{node.cumulativeStorage}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{node.performance}</span>
                          <span className="text-[11px] text-[#6b6b6b]">{node.uptime} uptime</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col">
                          <span className="text-[#00ffd5] font-semibold">{node.xdnScore}</span>
                          <span className="text-[11px] text-[#6b6b6b]">{node.lastSeen}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredNodes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No PNodes found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}