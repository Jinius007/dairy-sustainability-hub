"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Eye, MessageSquare, Reply, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface Draft {
  id: string;
  draftNumber: number;
  draftType: "ADMIN" | "USER";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

export default function DraftReportsManagement() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
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
    switch (type) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "USER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          Review and manage all draft reports submitted by users.
        </p>
      </div>

      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No drafts found. Drafts will appear here when users submit responses.</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{draft.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted by: {draft.user.name} ({draft.user.username})
                  </p>
                  <p className="text-sm text-gray-500">
                    Financial Year: {draft.financialYear} | Draft #{draft.draftNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(draft.createdAt).toLocaleDateString()} | 
                    Size: {formatFileSize(draft.fileSize)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                    {draft.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getDraftTypeColor(draft.draftType)}`}>
                    {draft.draftType}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(draft.fileUrl, '_blank')}
                  className="btn-secondary flex items-center space-x-2 px-3 py-1 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => window.open(draft.fileUrl, '_blank')}
                  className="btn-primary flex items-center space-x-2 px-3 py-1 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
