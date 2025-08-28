"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Download, Eye, Upload, MessageSquare, Reply, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface Draft {
  id: string;
  draftNumber: number;
  draftType: "ADMIN_TO_USER" | "USER_TO_ADMIN";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  uploadId: string;
  comments: string;
  createdAt: string;
  template: {
    name: string;
    financialYear: string;
  };
  originalUpload: {
    fileName: string;
    uploadedAt: string;
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
    formData.append("uploadId", selectedDraft.uploadId);
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
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "FINAL":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getDraftTypeColor = (type: string) => {
    return type === "ADMIN_TO_USER" 
      ? "bg-blue-100 text-blue-800 border-blue-200" 
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  const canRespondToDraft = (draft: Draft) => {
    return draft.draftType === "ADMIN_TO_USER" && draft.status === "PENDING_REVIEW";
  };

  const canMarkAsFinal = (draft: Draft) => {
    // Import the function from mock-drafts
    const { canMarkAsFinal: checkCanMarkAsFinal } = require("@/lib/mock-drafts");
    return checkCanMarkAsFinal(draft, session?.user?.id);
  };

  const sortedDrafts = drafts.sort((a, b) => {
    if (a.draftNumber !== b.draftNumber) {
      return b.draftNumber - a.draftNumber;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your draft reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Draft Reports
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Review and respond to draft reports from the admin. Upload your revised versions to continue the collaborative review process.
          </p>
        </div>

        {/* Response Form */}
        {showResponseForm && selectedDraft && (
          <div className="mb-8 card p-8 border-2 border-blue-200 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Reply className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Draft #{selectedDraft.draftNumber + 1}
                </h3>
                <p className="text-gray-600">Submit your revised version with improvements</p>
              </div>
            </div>
            <form onSubmit={handleRespondToDraft} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Upload Your Revised Draft
                </label>
                <input
                  type="file"
                  required
                  accept=".docx,.doc,.pdf"
                  onChange={handleFileChange}
                  className="input-field border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Upload your revised version with changes and improvements (Word/PDF only)
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Comments & Changes Made
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe the changes you made, improvements, or any questions for the admin..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={responding || !selectedFile}
                  className="btn-primary flex items-center space-x-3 disabled:opacity-50 px-8 py-3 text-lg"
                >
                  {responding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  <span>{responding ? "Uploading..." : `Upload Draft #${selectedDraft.draftNumber + 1}`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseForm(false);
                    setSelectedFile(null);
                    setComments("");
                    setSelectedDraft(null);
                  }}
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drafts List */}
        <div className="space-y-8">
          {sortedDrafts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Draft Reports Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                Draft reports will appear here when the admin creates them from your approved uploads. 
                You'll be able to review and respond with your revisions.
              </p>
            </div>
          ) : (
            sortedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="card p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        draft.draftType === "ADMIN_TO_USER" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600" 
                          : "bg-gradient-to-r from-green-600 to-emerald-600"
                      }`}>
                        {draft.draftType === "ADMIN_TO_USER" ? (
                          <Download className="h-6 w-6 text-white" />
                        ) : (
                          <Upload className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Draft #{draft.draftNumber} - {draft.fileName}
                        </h3>
                        <p className="text-gray-600">
                          {draft.draftType === "ADMIN_TO_USER" ? "From Admin" : "Your Response"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base text-gray-600">
                      <div className="space-y-2">
                        <p><span className="font-semibold">Template:</span> {draft.template.name}</p>
                        <p><span className="font-semibold">Financial Year:</span> {draft.financialYear}</p>
                      </div>
                      <div className="space-y-2">
                        <p><span className="font-semibold">Created:</span> {new Date(draft.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Size:</span> {formatFileSize(draft.fileSize)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 flex items-center">
                      <span className="font-semibold mr-2">Based on:</span> {draft.originalUpload.fileName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getDraftTypeColor(draft.draftType)}`}>
                      {draft.draftType === "ADMIN_TO_USER" ? "From Admin" : "Your Response"}
                    </span>
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(draft.status)}`}>
                      {draft.status}
                    </span>
                  </div>
                </div>
                
                {draft.comments && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">Comments:</p>
                        <p className="text-blue-800 leading-relaxed">{draft.comments}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <a
                    href={draft.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center space-x-2 px-6 py-3"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View</span>
                  </a>
                  <a
                    href={draft.fileUrl}
                    download
                    className="btn-primary flex items-center space-x-2 px-6 py-3"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </a>
                  {canRespondToDraft(draft) && (
                    <button
                      onClick={() => {
                        setSelectedDraft(draft);
                        setShowResponseForm(true);
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                    >
                      <Reply className="h-5 w-5" />
                      <span>Upload Draft #{draft.draftNumber + 1}</span>
                    </button>
                  )}
                  {canMarkAsFinal(draft) && (
                    <button
                      onClick={() => handleMarkAsFinal(draft.id)}
                      disabled={markingFinal === draft.id}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 disabled:opacity-50"
                    >
                      {markingFinal === draft.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      <span>{markingFinal === draft.id ? "Marking..." : "Mark as Final"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
