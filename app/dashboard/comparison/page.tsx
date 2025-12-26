'use client';

import { useState } from 'react';
import {
  Plus,
  X,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/lib/api';
import type { PNode } from '@/lib/api';

// API data is now fetched using SWR hooks

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const NodeSelector = ({
  selectedNodes,
  onToggleNode,
  searchTerm,
  onSearchChange
}: {
  selectedNodes: string[];
  onToggleNode: (nodeId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) => (
  <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Select Nodes to Compare</h3>

    {/* Search */}
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search nodes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Selected count */}
    <div className="text-sm text-gray-400 mb-4">
      Selected: {selectedNodes.length} / 5 nodes
    </div>

    {/* Node list */}
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {mockNodes
        .filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((node) => {
          const isSelected = selectedNodes.includes(node.id);
          return (
            <button
              key={node.id}
              onClick={() => onToggleNode(node.id)}
              disabled={!isSelected && selectedNodes.length >= 5}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
                isSelected
                  ? "bg-blue-600/20 border-blue-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700",
                !isSelected && selectedNodes.length >= 5 && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {node.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{node.name}</div>
                  <div className="text-xs text-gray-400">Score: {node.score}</div>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-blue-400" />}
            </button>
          );
        })}
    </div>
  </div>
);

const ComparisonCard = ({ nodes }: { nodes: any[] }) => (
  <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
    <div className="space-y-4">
      {nodes.map((node, index) => (
        <div key={node.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            <div>
              <div className="text-white font-medium">{node.name}</div>
              <div className="text-sm text-gray-400">ID: {node.id.slice(0, 8)}...</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{node.score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ComparisonPage() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leaderboardData, error, isLoading } = useLeaderboard(100);
  const nodes = leaderboardData?.leaderboard?.slice(0, 20) || []; // Use first 20 nodes

  const handleToggleNode = (nodeId: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else if (prev.length < 5) {
        return [...prev, nodeId];
      }
      return prev;
    });
  };

  const selectedNodeData = nodes.filter(node => selectedNodes.includes(node.id));

  // Transform data for charts (mock historical data for now)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const transformed: any = { date: date.toISOString().split('T')[0] };

    selectedNodeData.forEach((node) => {
      // Use current values with some variation for historical data
      transformed[`${node.name}_score`] = Math.max(85, node.xdnScore + (Math.random() - 0.5) * 5);
      transformed[`${node.name}_uptime`] = Math.max(95, node.uptime + (Math.random() - 0.5) * 2);
      transformed[`${node.name}_latency`] = Math.max(20, node.latency + (Math.random() - 0.5) * 10);
    });

    return transformed;
  });

  // TODO: Replace with actual API calls using SWR
  useEffect(() => {
    // const fetchNodes = async () => {
    //   try {
    //     const response = await fetch('/api/leaderbaord?limit=100');
    //     const data = await response.json();
    //     setNodes(data.leaderboard);
    //   } catch (error) {
    //     console.error('Failed to fetch nodes:', error);
    //   }
    // };
    // fetchNodes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Node Comparison</h1>
          <p className="text-gray-400 mt-1">Compare performance metrics across multiple nodes</p>
        </div>
        <div className="text-sm text-gray-400">
          Select 2-5 nodes to compare
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Selector */}
        <div className="lg:col-span-1">
          <NodeSelector
            selectedNodes={selectedNodes}
            onToggleNode={handleToggleNode}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Comparison Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedNodes.length < 2 ? (
            <div className="bg-[#111118] border border-gray-800 rounded-lg p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select at least 2 nodes</h3>
              <p className="text-gray-400">
                Choose nodes from the sidebar to start comparing their performance metrics.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <ComparisonCard nodes={selectedNodeData} />

              {/* Score Comparison Chart */}
              <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Score Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[95, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      {selectedNodeData.map((node, index) => (
                        <Line
                          key={node.id}
                          type="monotone"
                          dataKey={`${node.name}_score`}
                          stroke={colors[index]}
                          strokeWidth={2}
                          dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                          name={node.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Uptime Comparison Chart */}
              <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Uptime Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[99, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      {selectedNodeData.map((node, index) => (
                        <Bar
                          key={node.id}
                          dataKey={`${node.name}_uptime`}
                          fill={colors[index]}
                          name={node.name}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latency Comparison Chart */}
              <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Latency Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      {selectedNodeData.map((node, index) => (
                        <Line
                          key={node.id}
                          type="monotone"
                          dataKey={`${node.name}_latency`}
                          stroke={colors[index]}
                          strokeWidth={2}
                          dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                          name={node.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Metrics Table */}
              <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Metrics Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Node</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Uptime</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Latency</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">7-Day Avg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {selectedNodeData.map((node, index) => {
                        const sevenDayAvg = chartData.reduce((sum, day) => {
                          const score = day[`${node.name}_score`];
                          return sum + (score || 0);
                        }, 0) / chartData.length;

                        return (
                          <tr key={node.id} className="hover:bg-gray-800">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: colors[index] }}
                                />
                                <span className="text-white font-medium">{node.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white">{node.score}</td>
                            <td className="px-4 py-3 text-white">{node.uptime}%</td>
                            <td className="px-4 py-3 text-white">{node.avgLatency}ms</td>
                            <td className="px-4 py-3 text-white">{sevenDayAvg.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
