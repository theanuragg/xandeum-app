'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingSection = ({
  title,
  description,
  icon: Icon,
  children
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="bg-[#111118] border border-gray-800 rounded-lg p-6">
    <div className="flex items-start space-x-4 mb-6">
      <div className="p-2 bg-blue-600 rounded-lg">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingItem = ({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <label className="text-sm font-sans text-white">{label}</label>
      {description && (
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      )}
    </div>
    <div className="ml-4">
      {children}
    </div>
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Profile
    name: 'John Doe',
    email: 'john@example.com',
    timezone: 'UTC-5',

    // Notifications
    emailAlerts: true,
    pushNotifications: false,
    criticalAlerts: true,
    performanceAlerts: true,
    weeklyReports: false,

    // Appearance
    theme: 'dark',
    compactMode: false,
    animations: true,

    // Privacy
    publicProfile: false,
    dataSharing: false,
    analytics: true,

    // API
    apiRateLimit: 100,
    webhookUrl: '',
    apiKeyVisible: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Customize your dashboard experience</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors">
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <SettingSection
          title="Profile"
          description="Manage your account information and preferences"
          icon={User}
        >
          <SettingItem label="Display Name">
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleSettingChange('name', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </SettingItem>

          <SettingItem label="Email Address">
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </SettingItem>

          <SettingItem label="Timezone">
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC-12">UTC-12:00</option>
              <option value="UTC-8">UTC-08:00 (PST)</option>
              <option value="UTC-5">UTC-05:00 (EST)</option>
              <option value="UTC+0">UTC+00:00 (GMT)</option>
              <option value="UTC+1">UTC+01:00 (CET)</option>
              <option value="UTC+8">UTC+08:00 (CST)</option>
              <option value="UTC+9">UTC+09:00 (JST)</option>
            </select>
          </SettingItem>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection
          title="Notifications"
          description="Configure how and when you receive alerts"
          icon={Bell}
        >
          <SettingItem
            label="Email Alerts"
            description="Receive notifications via email"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Push Notifications"
            description="Receive browser push notifications"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Critical Alerts"
            description="Node offline, critical failures"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.criticalAlerts}
                onChange={(e) => handleSettingChange('criticalAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Performance Alerts"
            description="Score drops, latency spikes"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.performanceAlerts}
                onChange={(e) => handleSettingChange('performanceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Weekly Reports"
            description="Receive weekly performance summaries"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>
        </SettingSection>

        {/* Appearance Settings */}
        <SettingSection
          title="Appearance"
          description="Customize the look and feel of your dashboard"
          icon={Palette}
        >
          <SettingItem label="Theme">
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </SettingItem>

          <SettingItem
            label="Compact Mode"
            description="Reduce spacing for more content"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Animations"
            description="Enable smooth transitions and animations"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => handleSettingChange('animations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection
          title="Privacy & Security"
          description="Control your data and privacy settings"
          icon={Shield}
        >
          <SettingItem
            label="Public Profile"
            description="Make your watchlist and favorites visible to others"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.publicProfile}
                onChange={(e) => handleSettingChange('publicProfile', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Analytics Sharing"
            description="Help improve the platform by sharing usage data"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analytics}
                onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label="Data Sharing"
            description="Share anonymized data with research partners"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dataSharing}
                onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>
        </SettingSection>

        {/* API Settings */}
        <SettingSection
          title="API & Integrations"
          description="Configure API access and webhooks"
          icon={Database}
        >
          <SettingItem
            label="API Rate Limit"
            description="Requests per minute"
          >
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
              min="10"
              max="1000"
              className="px-3 py-2 w-24 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </SettingItem>

          <SettingItem
            label="Webhook URL"
            description="Receive real-time updates via webhook"
          >
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
              placeholder="https://your-app.com/webhook"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
          </SettingItem>

          <SettingItem
            label="API Key"
            description="Your personal API key for integrations"
          >
            <div className="flex items-center space-x-2">
              <input
                type={settings.apiKeyVisible ? 'text' : 'password'}
                value="xand-abcd-1234-efgh-5678"
                readOnly
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm flex-1"
              />
              <button
                onClick={() => handleSettingChange('apiKeyVisible', !settings.apiKeyVisible)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm"
              >
                {settings.apiKeyVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </SettingItem>
        </SettingSection>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <h4 className="text-white font-sans">Reset Dashboard</h4>
              <p className="text-sm text-gray-400">Reset all customizations to default settings</p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <h4 className="text-white font-sans">Delete Account</h4>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
