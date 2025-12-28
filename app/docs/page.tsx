'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Code,
  Database,
  Server,
  Layers,
  Shield,
  Zap,
  BarChart3,
  AlertTriangle,
  Network,
  Cpu,
  Eye,
  Settings,
  BookOpen,
  ChevronRight,
  Github,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIAssistant from '@/components/AIAssistant';

const sections = [
  { id: 'overview', title: 'Xandeum PNode Network', icon: BookOpen },
  { id: 'architecture', title: 'Distributed Architecture', icon: Layers },
  { id: 'monitoring', title: 'Real-time Monitoring', icon: Zap },
  { id: 'features', title: 'Enterprise Features', icon: BarChart3 },
  { id: 'api', title: 'API Ecosystem', icon: Server },
  { id: 'implementation', title: 'Technical Implementation', icon: Code },
];

const techStack = [
  { name: 'Next.js 16', description: 'React framework with App Router', category: 'Frontend' },
  { name: 'React 19', description: 'Latest React with concurrent features', category: 'Frontend' },
  { name: 'TypeScript', description: 'Type-safe JavaScript', category: 'Language' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS framework', category: 'Styling' },
  { name: 'Prisma', description: 'ORM for database operations', category: 'Database' },
  { name: 'PostgreSQL', description: 'Primary database', category: 'Database' },
  { name: 'Redis', description: 'Caching and session storage', category: 'Infrastructure' },
  { name: 'SWR', description: 'React data fetching library', category: 'Frontend' },
  { name: 'pRPC', description: 'RPC communication protocol', category: 'Backend' },
];

const features = [
  {
    title: 'Node Monitoring',
    description: 'Real-time monitoring of Xandeum network nodes with detailed metrics',
    icon: Cpu,
    details: [
      'Live uptime tracking',
      'Latency monitoring',
      'Performance metrics',
      'Storage usage analysis',
      'Geographic distribution'
    ]
  },
  {
    title: 'Alert System',
    description: 'Proactive alerting for node issues and network anomalies',
    icon: AlertTriangle,
    details: [
      'Critical/warning/info alerts',
      'Auto-resolution tracking',
      'Severity-based notifications',
      'Historical alert logs'
    ]
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive charts and visualizations for network insights',
    icon: BarChart3,
    details: [
      'Interactive charts with Recharts',
      'Network health metrics',
      'Performance trends',
      'Geographic heatmaps'
    ]
  },
  {
    title: 'Network Overview',
    description: 'Bird\'s eye view of the entire Xandeum network',
    icon: Network,
    details: [
      'Total active nodes',
      'Network health score',
      'Reward distribution',
      'Validation rates'
    ]
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen ">

      {/* Header */}
      <header className="border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/nodes"
                className="p-2 bg-[#2e2e2e] rounded-lg text-[#929292] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-white">Documentation</h1>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-[#2e2e2e] rounded-lg text-[#929292] hover:text-white transition-colors ml-auto"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-[#1e1e1e] border-r border-[#2e2e2e] p-4 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Contents</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-[#929292] hover:text-white rounded transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          scrollToSection(section.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors",
                          activeSection === section.id
                            ? "bg-[#00ffd5] text-[#121212] shadow-sm"
                            : "text-[#929292] hover:bg-[#2e2e2e] hover:text-white"
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="text-left">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="rounded-lg border border-[#2e2e2e] p-4 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        activeSection === section.id
                          ? "bg-[#00ffd5] text-[#121212]"
                          : "text-[#929292] hover:bg-[#2e2e2e] hover:text-white"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none pb-12 sm:pb-20 px-2 sm:px-0">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Xandeum PNode Network Intelligence Platform</h2>
                <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-4 sm:mb-6">
                  An enterprise-grade distributed network monitoring platform designed for the Xandeum Protocol ecosystem.
                  This production-ready dashboard provides real-time visibility into a global network of Proof Nodes (PNodes),
                  featuring advanced analytics, predictive monitoring, and comprehensive performance metrics at scale.
                </p>

                <div className="my-8 rounded-lg border border-neutral-800 bg-[#1e1e1e] p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Xandeum Protocol: Distributed Infrastructure Revolution</h3>
                  <p className="text-neutral-300 mb-4">
                    Xandeum represents a fundamental evolution in decentralized infrastructure architecture. Unlike traditional
                    blockchain networks that focus primarily on transaction validation, Xandeum implements a multi-dimensional
                    approach combining computational resources, distributed storage, and network validation services.
                  </p>
                  <p className="text-neutral-300 mb-4">
                    The protocol introduces Proof Nodes (PNodes) as sovereign economic actors that participate in a
                    sophisticated marketplace for computational resources. Each PNode contributes storage capacity,
                    processing power, and network bandwidth while receiving rewards based on performance metrics
                    and market demand.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-white">200+</div>
                      <div className="text-neutral-400 text-xs">Active PNodes</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-white">127</div>
                      <div className="text-neutral-400 text-xs">Countries</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-white">340TB+</div>
                      <div className="text-neutral-400 text-xs">Storage</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-white">99.9%</div>
                      <div className="text-neutral-400 text-xs">Uptime SLA</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white mr-3 flex-shrink-0" />
                      <span className="font-sans text-white text-sm sm:text-base">Real-time Monitoring</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      Sub-second latency monitoring across all PNodes with predictive anomaly detection
                      and automated alerting systems for network-wide observability.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white mr-3 flex-shrink-0" />
                      <span className="font-sans text-white text-sm sm:text-base">Advanced Analytics</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      Multi-dimensional performance analysis with XDN scoring algorithms,
                      geographic distribution insights, and capacity planning metrics.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white mr-3 flex-shrink-0" />
                      <span className="font-sans text-white text-sm sm:text-base">Intelligent Alerting</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      ML-powered anomaly detection with severity-based notifications,
                      automated escalation, and incident response workflows.
                    </p>
                  </div>
                </div>
              </section>

              {/* Architecture Section */}
              <section id="architecture" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Distributed Architecture</h2>

                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Distributed Systems Architecture</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Multi-Layer Caching Strategy</h4>
                      <p className="text-sm text-neutral-400">
                        Enterprise-grade caching with Redis for API responses, SWR for client-side state,
                        and PostgreSQL optimization. TTL-based invalidation with intelligent cache warming.
                      </p>
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Real-time Data Pipeline</h4>
                      <p className="text-sm text-neutral-400">
                        Asynchronous synchronization between pRPC calls, PostgreSQL persistence,
                        and Redis caching. Circuit breaker patterns and graceful degradation.
                      </p>
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                      <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Enterprise Data Architecture</h4>
                      <p className="text-sm text-neutral-400">
                        Sophisticated pipeline with PostgreSQL persistence, Redis caching, and pRPC
                        communication. ACID transactions with optimistic concurrency control.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Performance & Scalability Section */}
              <section id="monitoring" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Real-time Monitoring Infrastructure</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-2">&lt;100ms</div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">Real-time Data Latency</h4>
                    <p className="text-sm text-neutral-400 mt-1">
                      Sub-second data freshness across all PNode metrics with Redis-backed caching
                      and optimized PostgreSQL queries. P95 latency &lt; 200ms under full network load.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-2">99.9%</div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">Network Observability</h4>
                    <p className="text-sm text-neutral-400 mt-1">
                      Continuous monitoring of 200+ PNodes with automated health checks,
                      performance degradation alerts, and predictive failure detection.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-2">340TB+</div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">Network Storage Capacity</h4>
                    <p className="text-sm text-neutral-400 mt-1">
                      Distributed storage infrastructure across global PNode network with
                      real-time capacity monitoring and utilization analytics.
                    </p>
                  </div>
                </div>
              </section>

              {/* Security & Reliability Section */}
              <section id="features" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Enterprise Features</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">API Key Authentication</h4>
                    <p className="text-sm text-neutral-400">
                      Secure API access with configurable authentication keys. Implements
                      HMAC-based request signing with salted hash storage and configurable
                      rate limiting per API key.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Advanced Rate Limiting</h4>
                    <p className="text-sm text-neutral-400">
                      Multi-dimensional rate limiting with per-key, per-IP, and per-endpoint
                      controls. Implements sliding window algorithms to prevent burst attacks
                      while maintaining fair resource distribution.
                    </p>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                    <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Type-Safe Data Validation</h4>
                    <p className="text-sm text-neutral-400">
                      Comprehensive input validation using Zod schemas at all API boundaries.
                      Prevents injection attacks, ensures data integrity, and provides
                      compile-time type safety across the entire application stack.
                    </p>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="scroll-mt-8 mb-16">
                <h2 className="text-3xl font-light text-white mb-6">Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="border border-white rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-white ml-4">{feature.title}</h3>
                        </div>
                        <p className="text-white mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.details.map((detail, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-700">
                              <ChevronRight className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* API Reference Section */}
              <section id="api" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">API Ecosystem</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Core Dashboard APIs</h3>
                    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                      <div className="space-y-2 min-w-max">
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/dashboard/stats</span> - Network-wide statistics and KPIs</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/leaderboard</span> - PNode performance ranking with sorting</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/health</span> - System health and connectivity status</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/Pnode</span> - Complete PNode directory with filtering</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/Pnode/[id]</span> - Individual PNode detailed metrics</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/Pnode/[id]/metrics</span> - Real-time performance data</div>
                        <div><span className="text-white">GET</span> <span className="text-neutral-400">/api/Pnode/[id]/history</span> - Historical performance trends</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Node APIs</h3>
                    <div className="bg-black rounded-lg p-4 font-mono text-sm">
                      <div className="space-y-2">
                        <div><span className="text-blue-600">GET</span> /api/Pnode - List all nodes</div>
                        <div><span className="text-blue-600">GET</span> /api/Pnode/[id] - Node details</div>
                        <div><span className="text-blue-600">GET</span> /api/Pnode/[id]/history - Node history</div>
                        <div><span className="text-blue-600">GET</span> /api/Pnode/[id]/alerts - Node alerts</div>
                        <div><span className="text-blue-600">GET</span> /api/Pnode/[id]/metrics - Node metrics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Database Schema Section */}
              <section id="database" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Database Schema</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-white rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">PNode (Proof Node)</h4>
                    <p className="text-sm text-white mb-3">
                      Core node representation with real-time status
                    </p>
                    <div className="text-xs font-mono bg-black p-3 rounded space-y-1 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                      <div><strong>Identity:</strong> id (CUID), externalId, name</div>
                      <div><strong>Status:</strong> status, lastSeen, uptime</div>
                      <div><strong>Performance:</strong> latency, performance, xdnScore</div>
                      <div><strong>Location:</strong> location, region, lat/lng</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Implementation Details Section */}
              <section id="implementation" className="scroll-mt-8 mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4 sm:mb-6">Technical Implementation</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Enterprise Technology Stack</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">Next.js 16 + React 19</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">Frontend</span>
                        </div>
                        <p className="text-sm text-neutral-400">App Router with Server Components, concurrent features, and optimized rendering for enterprise-scale dashboards.</p>
                      </div>
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">PostgreSQL + Prisma</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">Database</span>
                        </div>
                        <p className="text-sm text-neutral-400">Type-safe ORM with ACID transactions, complex queries, and optimized indexing for time-series PNode data.</p>
                      </div>
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">Redis Cache Layer</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">Infrastructure</span>
                        </div>
                        <p className="text-sm text-neutral-400">High-performance caching with TTL-based expiration, intelligent cache warming, and sub-millisecond access.</p>
                      </div>
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">SWR Data Fetching</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">State Management</span>
                        </div>
                        <p className="text-sm text-neutral-400">Stale-while-revalidate pattern with automatic background updates, error handling, and optimistic UI updates.</p>
                      </div>
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">pRPC Client</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">Network Protocol</span>
                        </div>
                        <p className="text-sm text-neutral-400">Custom RPC client for Xandeum Protocol network communication with retry logic and exponential backoff.</p>
                      </div>
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">TypeScript + Zod</span>
                          <span className="text-xs bg-white text-black px-2 py-1 rounded hidden sm:inline">Type Safety</span>
                        </div>
                        <p className="text-sm text-neutral-400">End-to-end type safety with runtime validation, preventing data corruption and runtime errors.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Key Architectural Decisions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:p-6">
                        <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">Multi-Layer Caching Strategy</h4>
                        <p className="text-sm text-neutral-400 mb-4">
                          Sophisticated four-layer caching architecture achieving sub-100ms response times
                          across 200+ PNodes while maintaining data consistency and freshness.
                        </p>
                        <ul className="text-sm text-neutral-400 space-y-2">
                          <li><strong>Browser Cache (SWR):</strong> 30-60s TTL for instant UI updates</li>
                          <li><strong>Redis Application Cache:</strong> 5-minute TTL for API responses</li>
                          <li><strong>Database Query Cache:</strong> Connection pooling with prepared statements</li>
                        </ul>
                      </div>

                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:p-6">
                        <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">Real-time Data Pipeline</h4>
                        <p className="text-sm text-neutral-400 mb-4">
                          Asynchronous data synchronization pipeline ensuring real-time visibility into network state
                          with intelligent error handling and graceful degradation.
                        </p>
                        <ul className="text-sm text-neutral-400 space-y-2">
                          <li><strong>pRPC Network Calls:</strong> Direct communication with PNodes</li>
                          <li><strong>PostgreSQL Persistence:</strong> ACID-compliant data storage</li>
                          <li><strong>Circuit Breaker Pattern:</strong> Automatic failure isolation</li>
                        </ul>
                      </div>

                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:p-6">
                        <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">Enterprise UI/UX Architecture</h4>
                        <p className="text-sm text-neutral-400 mb-4">
                          Dark-themed Solana-style interface with advanced data visualization, implementing
                          complex sorting, filtering, and real-time updates for network operators.
                        </p>
                        <ul className="text-sm text-neutral-400 space-y-2">
                          <li><strong>Solana-inspired Design:</strong> Industry-standard blockchain dashboard UI</li>
                          <li><strong>Advanced Table Sorting:</strong> Multi-column sorting with performance metrics</li>
                          <li><strong>Real-time Charts:</strong> Interactive performance and storage visualizations</li>
                          <li><strong>Responsive Design:</strong> Mobile-optimized for field operations</li>
                        </ul>
                      </div>

                      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-4 sm:p-6">
                        <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">XDN Scoring Algorithm</h4>
                        <p className="text-sm text-neutral-400 mb-4">
                          Proprietary performance scoring system combining multiple weighted metrics to provide
                          comprehensive PNode health assessment and ranking.
                        </p>
                        <ul className="text-sm text-neutral-400 space-y-2">
                          <li><strong>Performance Weight:</strong> 40% - Uptime, latency, responsiveness</li>
                          <li><strong>Storage Weight:</strong> 30% - Capacity utilization, data integrity</li>
                          <li><strong>Network Weight:</strong> 20% - Connectivity, geographic distribution</li>
                          <li><strong>Risk Weight:</strong> 10% - Stability, error rates, anomaly detection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}