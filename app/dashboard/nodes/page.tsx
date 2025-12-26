'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink
} from 'lucide-react';
import { useLeaderboard } from '@/lib/api';

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

export default function NodesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leaderboardData, error, isLoading } = useLeaderboard(100);

  // Transform leaderboard data to include rank
  const nodes = leaderboardData?.leaderboard?.map((node: any, index: number) => ({
    ...node,
    rank: index + 1
  })) || [];

  // Filter nodes based on search
  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Validators</h1>
          <p className="text-gray-600 mt-2">Monitor and compare validator performance</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search validators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Nodes List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNodes.map((node: any) => (
                <div key={node.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          #{node.rank}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{node.name}</h3>
                          <StatusBadge status={node.status} />
                        </div>
                        <p className="text-sm text-gray-500">ID: {node.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-lg font-semibold text-gray-900">{node.xdnScore.toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Uptime</p>
                        <p className="text-lg font-semibold text-gray-900">{node.uptime.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Stake</p>
                        <p className="text-lg font-semibold text-gray-900">{node.stake.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">{node.location}</p>
                      </div>
                      <Link
                        href={`/dashboard/node/${node.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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

        {filteredNodes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No validators found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}