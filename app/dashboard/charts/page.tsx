'use client';

import {
  Activity,
  TrendingUp
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

// Mock data for charts
const networkHealthData = [
  { date: '2024-12-20', health: 91.2, activeNodes: 1150, totalNodes: 1200 },
  { date: '2024-12-21', health: 92.8, activeNodes: 1168, totalNodes: 1200 },
  { date: '2024-12-22', health: 93.1, activeNodes: 1175, totalNodes: 1200 },
  { date: '2024-12-23', health: 92.7, activeNodes: 1182, totalNodes: 1200 },
  { date: '2024-12-24', health: 93.4, activeNodes: 1189, totalNodes: 1200 },
  { date: '2024-12-25', health: 94.1, activeNodes: 1195, totalNodes: 1200 },
  { date: '2024-12-26', health: 93.8, activeNodes: 1201, totalNodes: 1200 },
];

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

const ChartCard = ({
  title,
  children,
  description
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
    {children}
  </div>
);

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Network Analytics</h1>
          <p className="text-gray-600 mt-2">Key performance metrics and trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Network Health"
            value="93.2%"
            icon={Activity}
            trend="+1.3% from last week"
            color="bg-green-500"
          />
          <MetricCard
            title="Avg Latency"
            value="43ms"
            icon={TrendingUp}
            trend="-2ms from yesterday"
            color="bg-blue-500"
          />
          <MetricCard
            title="Active Nodes"
            value="1,150"
            icon={Activity}
            trend="+25 this week"
            color="bg-purple-500"
          />
          <MetricCard
            title="Uptime"
            value="99.8%"
            icon={TrendingUp}
            trend="Stable"
            color="bg-orange-500"
          />
        </div>

        {/* Network Health Chart */}
        <ChartCard
          title="Network Health Over Time"
          description="Daily network health percentage and active node count"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="health"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  name="Health %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </div>
    </div>
  );
}