"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, Download, Eye, MessageSquare, Plus } from "lucide-react";

interface Draft {
  id: string;
  draftNumber: number;
  draftType: "ADMIN_TO_USER" | "USER_TO_ADMIN";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  userId: string;
  uploadId: string;
  comments: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
  template: {
    name: string;
    financialYear: string;
  };
  originalUpload: {
    fileName: string;
    uploadedAt: string;
  };
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface Upload {
  id: string;
  fileName: string;
  status: string;
  userId: string;
  user: {
    name: string;
    username: string;
  };
}

export default function DraftReportsManagement() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUpload, setSelectedUpload] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [creatingDraft, setCreatingDraft] = useState(false);

  useEffect(() => {
    fetchDrafts();
    fetchUsers();
    fetchUploads();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/admin/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((user: User) => user.role === "USER"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await fetch("/api/admin/uploads");
      if (response.ok) {
        const data = await response.json();
        setUploads(data);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  const handleStatusUpdate = async (draftId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/drafts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: draftId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchDrafts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedUser || !selectedUpload) return;

    setCreatingDraft(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", selectedUser);
    formData.append("uploadId", selectedUpload);
    formData.append("comments", comments);

    try {
      const response = await fetch("/api/admin/drafts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedFile(null);
        setComments("");
        setSelectedUser("");
        setSelectedUpload("");
        fetchDrafts(); // Refresh the list
        alert("Draft created successfully!");
      } else {
        alert("Error creating draft. Please try again.");
      }
    } catch (error) {
      console.error("Error creating draft:", error);
      alert("Error creating draft. Please try again.");
    } finally {
      setCreatingDraft(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "FINAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getDraftTypeColor = (type: string) => {
    return type === "ADMIN_TO_USER" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-orange-100 text-orange-800";
  };

  const filteredDrafts = selectedUser
    ? drafts.filter((draft) => draft.userId === selectedUser)
    : drafts;

  const approvedUploads = uploads.filter(upload => upload.status === "APPROVED");

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Draft Reports Management</h2>
                 <p className="text-sm text-gray-600 mb-4">
           Manage the back-and-forth draft process with users. Create draft reports (Word/PDF) from approved user uploads and track the review process.
         </p>
      </div>

      {/* Create New Draft Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Draft</span>
        </button>
      </div>

      {/* Create Draft Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-gray-900 mb-4">Create New Draft</h3>
          <form onSubmit={handleCreateDraft} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Approved Upload
                </label>
                <select
                  value={selectedUpload}
                  onChange={(e) => setSelectedUpload(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Choose an approved upload</option>
                  {approvedUploads
                    .filter(upload => !selectedUser || upload.userId === selectedUser)
                    .map((upload) => (
                      <option key={upload.id} value={upload.id}>
                        {upload.fileName} - {upload.user.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                 Upload Draft Report (Word/PDF)
               </label>
                             <input
                 type="file"
                 required
                 accept=".docx,.doc,.pdf"
                 onChange={handleFileChange}
                 className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add comments or instructions for the user..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={creatingDraft || !selectedFile || !selectedUser || !selectedUpload}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {creatingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{creatingDraft ? "Creating..." : "Create Draft"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedFile(null);
                  setComments("");
                  setSelectedUser("");
                  setSelectedUpload("");
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter by User */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by User
        </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.username})
            </option>
          ))}
        </select>
      </div>

      {/* Drafts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Draft Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrafts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No drafts found. Create a draft from an approved user upload.
                </td>
              </tr>
            ) : (
              filteredDrafts.map((draft) => (
                <tr key={draft.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {draft.user.name} ({draft.user.username})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>
                      <p className="font-medium">{draft.fileName}</p>
                      <p className="text-xs text-gray-400">
                        Draft #{draft.draftNumber} | {formatFileSize(draft.fileSize)}
                      </p>
                      <p className="text-xs text-gray-400">
                        From: {draft.originalUpload.fileName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDraftTypeColor(draft.draftType)}`}>
                      {draft.draftType === "ADMIN_TO_USER" ? "Admin → User" : "User → Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={draft.status}
                      onChange={(e) => handleStatusUpdate(draft.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border ${getStatusColor(draft.status)}`}
                    >
                      <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="FINAL">FINAL</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={draft.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View draft"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={draft.fileUrl}
                        download
                        className="text-green-600 hover:text-green-900"
                        title="Download draft"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {draft.comments && (
                        <span
                          className="text-blue-600 hover:text-blue-900 cursor-help"
                          title={draft.comments}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
