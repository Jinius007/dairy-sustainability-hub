"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Users, 
  Shield, 
  Calendar,
  Activity,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState({
    username: "",
    role: "",
    action: "",
    startDate: "",
    endDate: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "USER"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async (userId?: string) => {
    try {
      let url = "/api/admin/activities";
      if (userId) {
        url += `?userId=${userId}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ name: "", username: "", password: "", role: "USER" });
        fetchUsers();
        alert("User created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        alert("User deleted successfully!");
      } else {
        alert("Error deleting user. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    setShowActivityLogs(true);
    await fetchActivityLogs(user.id);
  };

  const handleFilterActivityLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.username) params.append("username", filters.username);
      if (filters.role) params.append("role", filters.role);
      if (filters.action) params.append("action", filters.action);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/activities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error filtering activity logs:", error);
    }
  };

  const getRoleColor = (role: string) => {
    return role === "ADMIN" 
      ? "bg-purple-100 text-purple-800 border-purple-200" 
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800";
      case "CREATE":
        return "bg-blue-100 text-blue-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user management...</p>
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
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            User Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create, manage, and monitor user accounts with comprehensive activity tracking and analytics.
          </p>
        </div>

        {/* Create User Button */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3"
          >
            <UserPlus className="h-5 w-5" />
            <span>Create New User</span>
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowActivityLogs(!showActivityLogs);
                if (!showActivityLogs) {
                  fetchActivityLogs();
                }
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 ${
                showActivityLogs 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Activity className="h-5 w-5" />
              <span>{showActivityLogs ? "Hide Activity Logs" : "View Activity Logs"}</span>
            </button>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="mb-8 card p-8 border-2 border-blue-200 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Create New User</h3>
                <p className="text-gray-600">Add a new user to the system</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    placeholder="Enter username"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-3 px-8 py-3 text-lg"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Create User</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: "", username: "", password: "", role: "USER" });
                  }}
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activity Logs Section */}
        {showActivityLogs && (
          <div className="mb-8 card p-8 border-2 border-green-200 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedUser ? `${selectedUser.name}'s Activity Logs` : "System Activity Logs"}
                </h3>
                <p className="text-gray-600">Monitor user activities and system events</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Activity Logs
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={filters.username}
                  onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                  className="input-field-sm"
                />
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="input-field-sm"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
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
                </select>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input-field-sm"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input-field-sm"
                />
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleFilterActivityLogs}
                  className="btn-primary flex items-center space-x-2 px-6 py-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => {
                    setFilters({ username: "", role: "", action: "", startDate: "", endDate: "" });
                    fetchActivityLogs(selectedUser?.id);
                  }}
                  className="btn-secondary px-6 py-2"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Activity Logs Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No activity logs found.
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {log.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{log.username}</div>
                              <div className="text-sm text-gray-500">{log.userRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.resourceName || log.resourceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card p-8 border-2 border-blue-200 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">User Accounts</h3>
              <p className="text-gray-600">Manage system users and their permissions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewActivity(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View activity logs"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
