'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Star,
  StarOff,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Server,
  Cpu,
  HardDrive,
  Zap,
  Network,
  AlertCircle,
  Search,
  Info,
  ExternalLink
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { usePNodeById, usePNodeHistory, usePNodeAlerts } from '@/lib/api';

// API data is now fetched using SWR hooks

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-500', text: 'text-green-400' },
    warning: { label: 'Warning', color: 'bg-yellow-500', text: 'text-yellow-400' },
    inactive: { label: 'Inactive', color: 'bg-red-500', text: 'text-red-400' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-sans", config.color, config.text)}>
      <span className="w-2 h-2 mr-2 bg-current rounded-full"></span>
      {config.label}
    </span>
  );
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-sans text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1">{trend}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const AlertItem = ({ alert }: { alert: any }) => (
  <div className={cn(
    "flex items-start space-x-3 p-4 rounded-lg border",
    alert.severity === 'critical' ? 'bg-red-900/20 border-red-800' :
    alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-800' :
    'bg-blue-900/20 border-blue-800'
  )}>
    <div className={cn(
      "p-1 rounded-full",
      alert.severity === 'critical' ? 'bg-red-500' :
      alert.severity === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    )}>
      <AlertTriangle className="h-3 w-3 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-white">{alert.message}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(alert.timestamp).toLocaleString()}
      </p>
    </div>
    {alert.resolved && (
      <CheckCircle className="h-4 w-4 text-green-400" />
    )}
  </div>
);

const PNodeHero = ({ node, searchTerm, onSearchChange }: { node: any, searchTerm: string, onSearchChange: (value: string) => void }) => {
  // Early return if node is not available
  if (!node) {
    return (
      <section className="w-full pt-8 pb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none opacity-20 palm-pattern" />
        <div className="container mx-auto max-w-[1200px] px-4">
          {/* Loading state */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-[#2e2e2e] rounded-[12px] p-2">
                    <div className="w-[89px] h-[89px] bg-[#2e2e2e] rounded-[8px] animate-pulse"></div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2 flex-1">
                  <div className="h-8 bg-[#2e2e2e] rounded w-48 animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-[#2e2e2e] rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-[#2e2e2e] rounded w-56 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#2e2e2e]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-[#2e2e2e] rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-[#2e2e2e] rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const storageUsedGB = node.storageUsed ? `${(parseInt(node.storageUsed) / (1024**3)).toFixed(2)} GB` : '0 GB';
  const storageCapacityGB = node.storageCapacity ? `${(parseInt(node.storageCapacity) / (1024**3)).toFixed(2)} GB` : '0 GB';
  const uptimePercent = node.uptime ? `${(node.uptime / 100).toFixed(1)}%` : '0%';
  const cpuUsagePercent = node.cpuPercent ? `${node.cpuPercent.toFixed(1)}%` : '0%';
  const memoryUsedGB = node.memoryUsed ? `${(parseInt(node.memoryUsed) / (1024**3)).toFixed(2)} GB` : '0 GB';
  const memoryTotalGB = node.memoryTotal ? `${(parseInt(node.memoryTotal) / (1024**3)).toFixed(2)} GB` : '0 GB';

  return (
    <section className="w-full pt-8 pb-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none opacity-20 palm-pattern" />

      <div className="container mx-auto max-w-[1200px] px-4">
        {/* Header Row: Title and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-[24px] font-sans text-black">PNode Details</h1>

          <div className="relative w-full md:w-[600px]">
            <input
              type="text"
              placeholder="Search for PNodes, addresses, locations, metrics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-[24px] py-3 pl-6 pr-12 text-[14px] text-white placeholder-[#929292] focus:outline-none focus:border-[#00ffd5] transition-colors"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#00ffd5] transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* PNode Identity Card */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Main Info Container */}
              <div className="flex-shrink-0">
                <div className="bg-[#2e2e2e] rounded-[12px] p-2">
                  <div className="w-[89px] h-[89px] bg-[#00ffd5] rounded-[8px] flex items-center justify-center text-[#2a2a2a] font-bold text-xl">
                    {node?.name?.charAt(0).toUpperCase() || node?.externalId?.charAt(0).toUpperCase() || 'N'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-[28px] font-bold text-white leading-none">{node.name}</h2>
                  <Link
                    href={`/dashboard/node/${node.id}`}
                    className="text-[11px] font-semibold text-[#00ffd5] bg-[#00ffd50d] border border-[#00ffd5] px-3 py-1 rounded-[24px] uppercase hover:bg-[#00ffd51a] transition-all"
                  >
                    View Details
                  </Link>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[14px]">
                    <span className="text-[#929292] min-w-[75px]">Node ID:</span>
                    <span className="text-white font-mono break-all text-[13px]">{node.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px]">
                    <span className="text-[#929292] min-w-[75px]">External ID:</span>
                    <span className="text-white font-mono break-all text-[13px]">{node.externalId}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-[#2e2e2e]" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between items-start border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <span className="text-[#929292] text-[14px]">Status</span>
                <span className={`text-[14px] text-right capitalize px-2 py-1 rounded ${
                  node.status === 'active' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                }`}>
                  {node.status}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <span className="text-[#929292] text-[14px]">Version</span>
                <span className="text-white text-[14px]">{node.version || 'Unknown'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#929292] text-[14px]">Uptime</span>
                  <Info size={12} className="text-[#929292]" />
                </div>
                <span className="text-white text-[14px]">{uptimePercent}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#929292] text-[14px]">Performance</span>
                  <Info size={12} className="text-[#929292]" />
                </div>
                <span className="text-white text-[14px]">{node.performance?.toLocaleString() || '0'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#929292] text-[14px]">Storage</span>
                  <Info size={12} className="text-[#929292]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white text-[14px]">{storageUsedGB}</span>
                  <span className="text-[#929292] text-[12px]">/ {storageCapacityGB}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#929292] text-[14px]">XDN Score</span>
                  <Info size={12} className="text-[#929292]" />
                </div>
                <span className="text-[#00ffd5] text-[14px] font-semibold">{node.xdnScore?.toLocaleString() || '0'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#2e2e2e]/50 pb-2 md:border-none md:pb-0">
                <span className="text-[#929292] text-[14px]">Location</span>
                <span className="text-white text-[14px]">{node.location || 'Unknown'}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#929292] text-[14px]">Last Seen</span>
                  <Info size={12} className="text-[#929292]" />
                </div>
                <span className="text-white text-[14px]">
                  {node.lastSeen ? new Date(node.lastSeen).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PNodeCharts = ({ node }: { node: any }) => {
  const [activeTab, setActiveTab] = useState("Performance");

  // Early return if node is not available
  if (!node) {
    return (
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6 animate-pulse">
        <div className="h-4 bg-[#2e2e2e] rounded w-48 mb-4"></div>
        <div className="h-48 bg-[#2e2e2e] rounded"></div>
      </div>
    );
  }

  // Generate mock historical data based on current values
  const getSafeNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
  };

  const performance = getSafeNumber(node.performance, 100000);
  const storageUsed = getSafeNumber(node.storageUsed, 50000);
  const xdnScore = getSafeNumber(node.xdnScore, 100000);
  const uptime = getSafeNumber(node.uptime, 95);
  const latency = getSafeNumber(node.latency, 50);

  const mockDataMap: Record<string, any[]> = {
    Performance: Array.from({ length: 20 }, (_, i) => ({
      name: `${i + 1}h ago`,
      value: Math.max(0, performance + (Math.random() - 0.5) * performance * 0.2),
    })),
    "Storage Usage": Array.from({ length: 20 }, (_, i) => ({
      name: `${i + 1}h ago`,
      value: Math.max(0, storageUsed + (Math.random() - 0.5) * storageUsed * 0.1),
    })),
    "XDN Score": Array.from({ length: 20 }, (_, i) => ({
      name: `${i + 1}h ago`,
      value: Math.max(0, xdnScore + (Math.random() - 0.5) * xdnScore * 0.15),
    })),
    Uptime: Array.from({ length: 20 }, (_, i) => ({
      name: `${i + 1}h ago`,
      value: Math.max(0, Math.min(100, uptime + (Math.random() - 0.5) * 10)),
    })),
    Latency: Array.from({ length: 20 }, (_, i) => ({
      name: `${i + 1}h ago`,
      value: Math.max(0, latency + (Math.random() - 0.5) * latency * 0.3),
    })),
  };

  const tabs = ["Performance", "Storage Usage", "XDN Score", "Uptime", "Latency"];
  const activeData = mockDataMap[activeTab] || [];

  // Ensure data is valid
  const validData = activeData.filter(item =>
    item && typeof item.value === 'number' && !isNaN(item.value)
  );

  return (
    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
      {/* Tabs Section */}
      <div className="flex overflow-x-auto pb-2 space-x-1 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-sans rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#00ffd5] text-[#121212]"
                  : "text-[#929292] hover:bg-[#2e2e2e] hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="mt-4" style={{ height: "200px", width: "100%" }}>
        {validData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={validData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffd5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00ffd5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#2e2e2e"
            />
            <XAxis
              dataKey="name"
              hide
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              hide
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #2e2e2e",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#00ffd5" }}
              labelStyle={{ color: "#929292", marginBottom: "4px" }}
              cursor={{ stroke: "#00ffd5", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00ffd5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#929292] text-sm">
            No chart data available
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sc-gfoqjT {
          font-family: "Inter", sans-serif;
          letter-spacing: -0.01em;
        }
        .sc-gfoqjT:hover {
           opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default function NodeDetailPage() {
  const params = useParams();
  const nodeId = params.id as string;
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const { data: node, error: nodeError, isLoading: nodeLoading } = usePNodeById(nodeId);
  const { data: historyData, error: historyError, isLoading: historyLoading } = usePNodeHistory(nodeId);
  const { data: alertsData, error: alertsError, isLoading: alertsLoading } = usePNodeAlerts(nodeId);

  const isLoading = nodeLoading || historyLoading || alertsLoading;
  const error = nodeError || historyError || alertsError;

  // Transform history data for charts
  const historicalData = Array.isArray(historyData)
    ? historyData.map((item: any, index: number) => ({
        date: new Date(item.timestamp).toISOString().split('T')[0],
        score: node?.xdnScore || 0, // Use current score as fallback
        uptime: item.uptime,
        latency: item.latency,
        participation: (item.uptime / 100) * 95 + Math.random() * 5, // Mock calculation
      }))
    : [];

  // Transform alerts data
  const alerts = Array.isArray(alertsData)
    ? alertsData.map((alert: any) => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        type: alert.type,
        timestamp: alert.createdAt,
        resolved: alert.isResolved
      }))
    : []; 

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    // TODO: Implement watchlist API call
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              href="/dashboard/nodes"
              className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-sans text-gray-900 mb-2">Failed to load node data</h3>
            <p className="text-gray-600">Please try again later or check if the node exists.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <PNodeHero node={node} searchTerm="" onSearchChange={() => {}} />
      <div className="container mx-auto max-w-[1200px] px-4 mt-8">
        <PNodeCharts node={node} />
      </div>

      {/* Additional Metrics Section */}
      <div className="container mx-auto max-w-[1200px] px-4 mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {node ? (
            <>
              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans text-[#929292]">CPU Usage</p>
                    <p className="text-2xl font-bold text-white">{node.cpuPercent?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2e2e2e]">
                    <Cpu className="h-6 w-6 text-[#00ffd5]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans text-[#929292]">Memory Usage</p>
                    <p className="text-2xl font-bold text-white">
                      {node.memoryTotal ? `${((parseInt(node.memoryUsed) / parseInt(node.memoryTotal)) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2e2e2e]">
                    <Server className="h-6 w-6 text-[#00ffd5]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans text-[#929292]">Network I/O</p>
                    <p className="text-2xl font-bold text-white">
                      {node.packetsIn || 0} / {node.packetsOut || 0}
                    </p>
                    <p className="text-xs text-[#6b6b6b]">In / Out packets</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2e2e2e]">
                    <Network className="h-6 w-6 text-[#00ffd5]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans text-[#929292]">Risk Score</p>
                    <p className="text-2xl font-bold text-white">{node.riskScore?.toFixed(1) || 0}</p>
                    <p className="text-xs text-[#6b6b6b]">
                      {node.riskScore < 0 ? 'Low Risk' : node.riskScore < 50 ? 'Medium Risk' : 'High Risk'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2e2e2e]">
                    <AlertTriangle className="h-6 w-6 text-[#00ffd5]" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[12px] p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-[#2e2e2e] rounded w-20"></div>
                    <div className="h-6 bg-[#2e2e2e] rounded w-12"></div>
                    <div className="h-3 bg-[#2e2e2e] rounded w-16"></div>
                  </div>
                  <div className="h-10 w-10 bg-[#2e2e2e] rounded-lg"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
