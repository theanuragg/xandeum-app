'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", config.color, config.text)}>
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
        <p className="text-sm font-medium text-gray-600">{title}</p>
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              href="/dashboard"
              className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load node data</h3>
            <p className="text-gray-600">Please try again later or check if the node exists.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              {node ? (
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">{node.name}</h1>
                  <StatusBadge status={node.status} />
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
              )}
            </div>
          </div>

          {node && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <span>ID: {node.id}</span>
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {node.location} ({node.region})
              </span>
              <span>Last seen: {new Date(node.lastSeen).toLocaleString()}</span>
              <span>Score: {node.xdnScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {node ? (
            <>
              <MetricCard
                title="Uptime"
                value={`${node.uptime.toFixed(1)}%`}
                icon={Clock}
                color="bg-green-500"
              />
              <MetricCard
                title="Latency"
                value={`${node.latency}ms`}
                icon={Zap}
                color="bg-blue-500"
              />
              <MetricCard
                title="Stake"
                value={node.stake.toLocaleString()}
                icon={TrendingUp}
                color="bg-purple-500"
              />
              <MetricCard
                title="Risk Score"
                value={node.riskScore.toFixed(1)}
                icon={AlertTriangle}
                color={node.riskScore < 5 ? "bg-green-500" : "bg-yellow-500"}
              />
            </>
          ) : (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Performance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Uptime History</h3>
            <p className="text-sm text-gray-600">Node availability over time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={[95, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="uptime"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
