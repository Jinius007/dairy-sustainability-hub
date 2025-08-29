"use client";

import { useState, useEffect } from 'react';
import { getMockData, clearMockData } from '@/lib/mock-storage';
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  Users, 
  FileText, 
  Activity,
  Download,
  Eye,
  Upload
} from 'lucide-react';

export default function TestStoragePage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage
    setDrafts(getMockData('DRAFTS'));
    setUploads(getMockData('UPLOADS'));
    setUsers(getMockData('USERS'));
    setTemplates(getMockData('TEMPLATES'));
    setActivityLogs(getMockData('ACTIVITY_LOGS'));
  }, []);

  const handleRefresh = () => {
    setDrafts(getMockData('DRAFTS'));
    setUploads(getMockData('UPLOADS'));
    setUsers(getMockData('USERS'));
    setTemplates(getMockData('TEMPLATES'));
    setActivityLogs(getMockData('ACTIVITY_LOGS'));
  };

  const handleClear = () => {
    clearMockData();
    setDrafts([]);
    setUploads([]);
    setUsers([]);
    setTemplates([]);
    setActivityLogs([]);
  };

  const exportData = () => {
    const data = {
      drafts: getMockData('DRAFTS'),
      uploads: getMockData('UPLOADS'),
      users: getMockData('USERS'),
      templates: getMockData('TEMPLATES'),
      activityLogs: getMockData('ACTIVITY_LOGS')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Mock Storage Test Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Monitor and manage mock data storage for development and testing purposes.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-3"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh Data</span>
          </button>
          
          <button
            onClick={exportData}
            className="btn-secondary flex items-center space-x-3"
          >
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </button>
          
          <button
            onClick={handleClear}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Data Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{drafts.length}</h3>
            <p className="text-gray-600">Drafts</p>
          </div>

          <div className="card p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{uploads.length}</h3>
            <p className="text-gray-600">Uploads</p>
          </div>

          <div className="card p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{users.length}</h3>
            <p className="text-gray-600">Users</p>
          </div>

          <div className="card p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{templates.length}</h3>
            <p className="text-gray-600">Templates</p>
          </div>

          <div className="card p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{activityLogs.length}</h3>
            <p className="text-gray-600">Activity Logs</p>
          </div>
        </div>

        {/* Detailed Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drafts */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Drafts ({drafts.length})</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {drafts.map((draft) => (
                <div key={draft.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{draft.fileName}</p>
                  <p className="text-sm text-gray-600">User: {draft.user?.name}</p>
                  <p className="text-sm text-gray-600">Status: {draft.status}</p>
                  <p className="text-sm text-gray-600">Version: v{draft.draftNumber}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Uploads */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Upload className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Uploads ({uploads.length})</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {uploads.map((upload) => (
                <div key={upload.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{upload.fileName}</p>
                  <p className="text-sm text-gray-600">User: {upload.user?.name}</p>
                  <p className="text-sm text-gray-600">Status: {upload.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Users */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Users ({users.length})</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">Username: {user.username}</p>
                  <p className="text-sm text-gray-600">Role: {user.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Templates ({templates.length})</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <div key={template.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-600">File: {template.fileName}</p>
                  <p className="text-sm text-gray-600">Year: {template.financialYear}</p>
                  <p className="text-sm text-gray-600">Version: v{template.version}</p>
                  <p className="text-sm text-gray-600">Status: {template.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="mt-8 card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity Logs ({activityLogs.length})</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{log.description}</p>
                    <p className="text-sm text-gray-600">User: {log.username} ({log.userRole})</p>
                    <p className="text-sm text-gray-600">Action: {log.action} | Resource: {log.resourceType}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
