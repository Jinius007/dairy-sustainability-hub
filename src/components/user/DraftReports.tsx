"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Download, Eye, Upload, MessageSquare, FileText, CheckCircle, AlertCircle, Plus } from "lucide-react";

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
  acceptedAsFinal: boolean;
  acceptedBy?: string;
  acceptedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

export default function DraftReports() {
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [financialYear, setFinancialYear] = useState("");
  const [creating, setCreating] = useState(false);
  const [acceptingDraft, setAcceptingDraft] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
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

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !financialYear) return;

    setCreating(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("financialYear", financialYear);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedFile(null);
        setFinancialYear("");
        fetchDrafts(); // Refresh the list
        alert("Draft created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error creating draft: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error creating draft:", error);
      alert("Error creating draft. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptDraft = async (draftId: string) => {
    if (!confirm("Are you sure you want to accept this draft as final? This will end the review process for this report.")) {
      return;
    }

    setAcceptingDraft(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchDrafts(); // Refresh the list
        alert("Draft accepted as final successfully!");
      } else {
        alert("Error accepting draft. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting draft:", error);
      alert("Error accepting draft. Please try again.");
    } finally {
      setAcceptingDraft(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Draft Reports</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Draft
        </button>
      </div>

      {/* Create Draft Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Create New Draft</h3>
          <form onSubmit={handleCreateDraft} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year
              </label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                placeholder="e.g., 2024-25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draft File
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedFile(null);
                  setFinancialYear("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !selectedFile || !financialYear}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Draft"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drafts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {drafts.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No drafts found. Create your first draft to get started.
            </li>
          ) : (
            drafts.map((draft) => (
              <li key={draft.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Draft {draft.draftNumber} - {draft.fileName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          draft.draftType === "ADMIN" 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {draft.draftType}
                        </span>
                        {draft.acceptedAsFinal && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Final
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(draft.fileSize)}</span>
                        <span>FY: {draft.financialYear}</span>
                        <span>Created: {formatDate(draft.createdAt)}</span>
                        <span className={`capitalize ${
                          draft.status === "PENDING_REVIEW" ? "text-yellow-600" :
                          draft.status === "APPROVED" ? "text-green-600" :
                          draft.status === "REJECTED" ? "text-red-600" :
                          "text-gray-600"
                        }`}>
                          {draft.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={draft.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                    <a
                      href={draft.fileUrl}
                      download
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                    {draft.draftType === "ADMIN" && !draft.acceptedAsFinal && (
                      <button
                        onClick={() => handleAcceptDraft(draft.id)}
                        disabled={acceptingDraft === draft.id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {acceptingDraft === draft.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept as Final
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
