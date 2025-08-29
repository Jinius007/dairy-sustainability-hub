"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Download, Eye, Upload, MessageSquare, Reply, FileText, CheckCircle, AlertCircle } from "lucide-react";

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

export default function DraftReports() {
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [responding, setResponding] = useState(false);
  const [markingFinal, setMarkingFinal] = useState<string | null>(null);

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

  const handleRespondToDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedDraft) return;

    setResponding(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("uploadId", selectedDraft.id);
    formData.append("comments", comments);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowResponseForm(false);
        setSelectedFile(null);
        setComments("");
        setSelectedDraft(null);
        fetchDrafts(); // Refresh the list
        alert("Response submitted successfully!");
      } else {
        alert("Error submitting response. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Error submitting response. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  const handleMarkAsFinal = async (draftId: string) => {
    if (!confirm("Are you sure you want to mark this draft as final? This will end the review process for this report.")) {
      return;
    }

    setMarkingFinal(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}/final`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "FINAL" }),
      });

      if (response.ok) {
        fetchDrafts(); // Refresh the list
        alert("Draft marked as final successfully!");
      } else {
        alert("Error marking draft as final. Please try again.");
      }
    } catch (error) {
      console.error("Error marking draft as final:", error);
      alert("Error marking draft as final. Please try again.");
    } finally {
      setMarkingFinal(null);
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Draft Reports</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and respond to draft reports from the admin. You can download drafts, respond with changes, or mark them as final.
        </p>
      </div>

      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No drafts found. Drafts will appear here when the admin creates them for you.</p>
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
                    Financial Year: {draft.financialYear} | Draft #{draft.draftNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(draft.createdAt).toLocaleDateString()} | 
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
                {draft.status === "PENDING_REVIEW" && (
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Respond</span>
                  </button>
                )}
                {draft.status === "APPROVED" && (
                  <button
                    onClick={() => handleMarkAsFinal(draft.id)}
                    disabled={markingFinal === draft.id}
                    className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2 text-sm"
                  >
                    {markingFinal === draft.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{markingFinal === draft.id ? "Marking..." : "Mark as Final"}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Form Modal */}
      {showResponseForm && selectedDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Respond to Draft</h3>
            <form onSubmit={handleRespondToDraft} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Response File
                </label>
                <input
                  type="file"
                  required
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
                  placeholder="Add any comments or feedback..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={responding || !selectedFile}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {responding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{responding ? "Submitting..." : "Submit Response"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseForm(false);
                    setSelectedFile(null);
                    setComments("");
                    setSelectedDraft(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
