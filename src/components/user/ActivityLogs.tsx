"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  Activity, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter
} from "lucide-react";

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  description: string;
  resourceType: string;
  resourceName?: string;
  createdAt: string;
}

export default function ActivityLogs() {
  const { data: session } = useSession();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchActivityLogs();
    }
  }, [session]);

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/user/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterActivityLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append("action", filters.action);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/user/activity?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error filtering activity logs:", error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <User className="h-4 w-4" />;
      case "LOGOUT":
        return <User className="h-4 w-4" />;
      case "CREATE":
        return <FileText className="h-4 w-4" />;
      case "UPDATE":
        return <FileText className="h-4 w-4" />;
      case "DELETE":
        return <FileText className="h-4 w-4" />;
      case "UPLOAD":
        return <Upload className="h-4 w-4" />;
      case "DOWNLOAD":
        return <Download className="h-4 w-4" />;
      case "VIEW":
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800 border-green-200";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CREATE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      case "UPLOAD":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DOWNLOAD":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "VIEW":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResourceTypeColor = (resourceType: string) => {
    switch (resourceType) {
      case "TEMPLATE":
        return "bg-blue-50 text-blue-700";
      case "UPLOAD":
        return "bg-green-50 text-green-700";
      case "DRAFT":
        return "bg-purple-50 text-purple-700";
      case "USER":
        return "bg-orange-50 text-orange-700";
      case "LOGIN":
        return "bg-cyan-50 text-cyan-700";
      case "LOGOUT":
        return "bg-gray-50 text-gray-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            My Activity Logs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your activities and interactions with the sustainability reporting system.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 card p-6 border-2 border-blue-200 shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filter Activities</h3>
              <p className="text-gray-600">Refine your activity history</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="input-field-sm"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="UPLOAD">Upload</option>
              <option value="DOWNLOAD">Download</option>
              <option value="VIEW">View</option>
            </select>

            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="input-field-sm"
            >
              <option value="">All Resources</option>
              <option value="TEMPLATE">Templates</option>
              <option value="UPLOAD">Uploads</option>
              <option value="DRAFT">Drafts</option>
              <option value="USER">User</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field-sm"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field-sm"
              placeholder="End Date"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleFilterActivityLogs}
              className="btn-primary flex items-center space-x-2 px-6 py-2"
            >
              <Search className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => {
                setFilters({ action: "", resourceType: "", startDate: "", endDate: "" });
                fetchActivityLogs();
              }}
              className="btn-secondary px-6 py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card p-8 border-2 border-blue-200 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Activity History</h3>
              <p className="text-gray-600">Your recent activities and interactions</p>
            </div>
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Activities Found</h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                {filters.action || filters.resourceType || filters.startDate || filters.endDate
                  ? "No activities match your current filters. Try adjusting your search criteria."
                  : "You haven't performed any activities yet. Start using the system to see your activity history here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            <span className="ml-1">{log.action}</span>
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResourceTypeColor(log.resourceType)}`}>
                            {log.resourceType}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-1">{log.description}</p>
                        {log.resourceName && (
                          <p className="text-sm text-gray-600 mb-2">
                            Resource: <span className="font-medium">{log.resourceName}</span>
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
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
