"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Download,
  Users,
  FileText,
  Upload,
  Activity,
  Settings
} from "lucide-react";

interface DatabaseStats {
  users: number;
  uploads: number;
  drafts: number;
  templates: number;
  activityLogs: number;
}

export default function TestStorage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          users: data.totalUsers || 0,
          uploads: data.totalUploads || 0,
          drafts: data.totalDrafts || 0,
          templates: data.totalTemplates || 0,
          activityLogs: data.totalActivityLogs || 0
        });
      }
    } catch (error) {
      console.error('Error fetching database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDatabaseStats();
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/export-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database-export.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Database className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl text-gray-600">Loading database statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Database className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Database Management Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Monitor and manage your Neon PostgreSQL database and Vercel Blob storage.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 border-2 border-blue-200 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-2 border-green-200 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.uploads || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-2 border-purple-200 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.drafts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-2 border-orange-200 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.templates || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-2 border-cyan-200 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activity Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activityLogs || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card p-8 border-2 border-blue-200 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Database Actions</h3>
              <p className="text-gray-600">Manage your database and export data</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRefresh}
              className="btn-primary flex items-center space-x-2 px-6 py-3"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh Stats</span>
            </button>

            <button
              onClick={handleExportData}
              className="btn-secondary flex items-center space-x-2 px-6 py-3"
            >
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Database Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Database:</strong> Neon PostgreSQL</p>
              <p><strong>File Storage:</strong> Vercel Blob</p>
              <p><strong>Authentication:</strong> NextAuth.js with bcrypt</p>
              <p><strong>ORM:</strong> Prisma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
