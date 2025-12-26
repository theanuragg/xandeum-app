'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Star,
  StarOff,
  Eye,
  Mail,
  MessageSquare,
  Filter,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/lib/api';

// Mock data - replace with actual API calls
const mockWatchlist = [
  { id: 'ABC123DEF456', name: 'Node-Apex-01', score: 98.7, status: 'active', alertsEnabled: true },
  { id: 'DEF789GHI012', name: 'Validator-Pro-02', score: 97.3, status: 'active', alertsEnabled: true },
  { id: 'GHI345JKL678', name: 'SecureNode-03', score: 96.8, status: 'warning', alertsEnabled: false },
];

const mockAlerts = [
  {
    id: '1',
    nodeId: 'ABC123DEF456',
    nodeName: 'Node-Apex-01',
    severity: 'warning',
    type: 'latency',
    message: 'Latency spike detected: 78ms (avg: 45ms)',
    timestamp: '2024-12-26T10:30:00Z',
    resolved: false,
    acknowledged: false
  },
  {
    id: '2',
    nodeId: 'DEF789GHI012',
    nodeName: 'Validator-Pro-02',
    severity: 'info',
    type: 'performance',
    message: 'Performance score improved by 1.2 points',
    timestamp: '2024-12-25T14:15:00Z',
    resolved: true,
    acknowledged: true
  },
  {
    id: '3',
    nodeId: 'ABC123DEF456',
    nodeName: 'Node-Apex-01',
    severity: 'critical',
    type: 'status',
    message: 'Node went offline for 5 minutes',
    timestamp: '2024-12-24T08:45:00Z',
    resolved: true,
    acknowledged: false
  },
  {
    id: '4',
    nodeId: 'GHI345JKL678',
    nodeName: 'SecureNode-03',
    severity: 'warning',
    type: 'storage',
    message: 'Storage usage above 85% threshold',
    timestamp: '2024-12-23T16:20:00Z',
    resolved: false,
    acknowledged: false
  },
];

const AlertItem = ({
  alert,
  onAcknowledge,
  onResolve
}: {
  alert: any;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) => {
  const severityConfig = {
    critical: { bg: 'bg-red-900/20', border: 'border-red-800', icon: AlertTriangle, color: 'text-red-400' },
    warning: { bg: 'bg-yellow-900/20', border: 'border-yellow-800', icon: AlertTriangle, color: 'text-yellow-400' },
    info: { bg: 'bg-blue-900/20', border: 'border-blue-800', icon: Bell, color: 'text-blue-400' },
  };

  const config = severityConfig[alert.severity as keyof typeof severityConfig];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 rounded-lg border",
      config.bg,
      config.border
    )}>
      <div className={cn("p-2 rounded-full bg-current", config.color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{alert.nodeName}</span>
            <span className={cn("px-2 py-1 text-xs rounded-full", config.color, config.bg)}>
              {alert.type}
            </span>
          </div>
          {!alert.acknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Acknowledge
            </button>
          )}
        </div>
        <p className="text-white mb-2">{alert.message}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
          <div className="flex items-center space-x-2">
            {alert.resolved ? (
              <span className="text-xs text-green-400 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </span>
            ) : (
              <button
                onClick={() => onResolve(alert.id)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WatchlistItem = ({
  node,
  onToggleAlerts,
  onRemoveFromWatchlist
}: {
  node: any;
  onToggleAlerts: (id: string) => void;
  onRemoveFromWatchlist: (id: string) => void;
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {node.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div>
        <div className="text-white font-medium">{node.name}</div>
        <div className="text-sm text-gray-400">Score: {node.score}</div>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        node.status === 'active' ? 'bg-green-500 text-green-900' :
        node.status === 'warning' ? 'bg-yellow-500 text-yellow-900' :
        'bg-red-500 text-red-900'
      )}>
        {node.status}
      </span>
      <button
        onClick={() => onToggleAlerts(node.id)}
        className={cn(
          "p-2 rounded-lg transition-colors",
          node.alertsEnabled
            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-400"
        )}
        title={node.alertsEnabled ? 'Disable alerts' : 'Enable alerts'}
      >
        {node.alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>
      <Link
        href={`/dashboard/node/${node.id}`}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        onClick={() => onRemoveFromWatchlist(node.id)}
        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        title="Remove from watchlist"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default function AlertsPage() {
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'acknowledged'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const { data: leaderboardData, error, isLoading } = useLeaderboard(50);

  // Generate mock alerts based on real node data
  const generatedAlerts = leaderboardData?.leaderboard?.slice(0, 10).map((node: any, index: number) => ({
    id: `alert-${node.id}-${index}`,
    nodeId: node.id,
    nodeName: node.name,
    severity: index % 3 === 0 ? 'critical' : index % 2 === 0 ? 'warning' : 'info',
    type: ['latency', 'performance', 'uptime', 'storage'][index % 4],
    message: `${node.name} ${['latency spike detected', 'performance dropped', 'went offline briefly', 'storage usage high'][index % 4]}`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    resolved: Math.random() > 0.7,
    acknowledged: Math.random() > 0.5
  })) || mockAlerts;

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unresolved' && alert.resolved) return false;
    if (filter === 'acknowledged' && !alert.acknowledged) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const handleToggleAlerts = (nodeId: string) => {
    setWatchlist(prev => prev.map(node =>
      node.id === nodeId ? { ...node, alertsEnabled: !node.alertsEnabled } : node
    ));
  };

  const handleRemoveFromWatchlist = (nodeId: string) => {
    setWatchlist(prev => prev.filter(node => node.id !== nodeId));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  // Initialize alerts state with generated alerts based on real node data
  useEffect(() => {
    if (generatedAlerts.length > 0 && alerts.length === 0) {
      setAlerts(generatedAlerts);
    }
  }, [generatedAlerts.length]);

  const unresolvedCount = alerts.filter(a => !a.resolved).length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts & Watchlist</h1>
          <p className="text-gray-400 mt-1">Monitor your favorite nodes and stay updated</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {unresolvedCount} unresolved • {unacknowledgedCount} unacknowledged
          </div>
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
            <Settings className="h-4 w-4 mr-2 inline" />
            Notification Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist */}
        <div className="lg:col-span-1">
          <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Watchlist ({watchlist.length})
            </h3>

            {watchlist.length > 0 ? (
              <div className="space-y-3">
                {watchlist.map((node) => (
                  <WatchlistItem
                    key={node.id}
                    node={node}
                    onToggleAlerts={handleToggleAlerts}
                    onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StarOff className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No nodes in watchlist</p>
                <Link
                  href="/dashboard/nodes"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Browse nodes to add →
                </Link>
              </div>
            )}

            {/* Notification Settings */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-medium text-white mb-3">Notification Channels</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Email notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Webhook notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-2">
          <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Alerts</option>
                  <option value="unresolved">Unresolved</option>
                  <option value="acknowledged">Acknowledged</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>

            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                <p className="text-gray-400">
                  {filter === 'unresolved'
                    ? 'No unresolved alerts at this time.'
                    : 'No alerts match your current filters.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Types Legend */}
      <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <div className="text-white font-medium">Critical</div>
              <div className="text-sm text-gray-400">Node offline, critical failures</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="text-white font-medium">Warning</div>
              <div className="text-sm text-gray-400">Performance drops, high latency</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-white font-medium">Info</div>
              <div className="text-sm text-gray-400">Performance improvements, updates</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Resolved</div>
              <div className="text-sm text-gray-400">Issues that have been fixed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
