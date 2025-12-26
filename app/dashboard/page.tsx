'use client';
import {
  Activity,
  Server,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useDashboardStats, useLeaderboard } from '@/lib/api';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
    warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
    inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.color)}>
      <span className="w-1.5 h-1.5 mr-1.5 bg-current rounded-full"></span>
      {config.label}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  subtitle,
  isLoading
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
  subtitle?: string;
  isLoading?: boolean;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const TimeRangeSelector = () => (
  <div className="flex space-x-2 mb-6">
    {['Last 24h', '7d', '30d', 'All Time'].map((range) => (
      <button
        key={range}
        className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        {range}
      </button>
    ))}
  </div>
);

export default function Dashboard() {
  const { data: stats, error: statsError, isLoading: statsLoading } = useDashboardStats();
  const { data: leaderboardData, error: leaderboardError, isLoading: leaderboardLoading } = useLeaderboard(10, 'xdnScore');

  // Transform leaderboard data to include rank
  const topValidators = leaderboardData?.leaderboard?.map((node: any, index: number) => ({
    ...node,
    rank: index + 1
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Xandeum Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your validator network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Nodes"
            value={stats?.totalNodes?.toLocaleString() || '0'}
            icon={Server}
            color="bg-blue-500"
            subtitle="Registered nodes"
            isLoading={statsLoading}
          />
          <StatCard
            title="Active Nodes"
            value={stats?.activeNodes?.toLocaleString() || '0'}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Currently online"
            isLoading={statsLoading}
          />
          <StatCard
            title="Network Health"
            value={`${(stats?.networkHealth || 0).toFixed(1)}%`}
            icon={Activity}
            color="bg-orange-500"
            subtitle="System reliability"
            isLoading={statsLoading}
          />
          <StatCard
            title="Avg Latency"
            value={`${(stats?.averageLatency || 0).toFixed(0)}ms`}
            icon={Globe}
            color="bg-purple-500"
            subtitle="Response time"
            isLoading={statsLoading}
          />
        </div>

        {/* Top Validators */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Validators</h2>
              <Link
                href="/dashboard/nodes"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          {leaderboardLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : leaderboardError ? (
            <div className="p-6 text-center text-gray-500">
              Failed to load validators
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topValidators.slice(0, 5).map((validator: any) => (
                <div key={validator.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        #{validator.rank}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{validator.name}</h3>
                          <StatusBadge status={validator.status} />
                        </div>
                        <p className="text-sm text-gray-500">{validator.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-sm font-semibold text-gray-900">{validator.xdnScore.toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Uptime</p>
                        <p className="text-sm font-semibold text-gray-900">{validator.uptime.toFixed(1)}%</p>
                      </div>
                      <Link
                        href={`/dashboard/node/${validator.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
