"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Eye, Upload, MessageSquare, Reply } from "lucide-react";

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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [responding, setResponding] = useState(false);

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

  const sortedDrafts = drafts.sort((a, b) => {
    if (a.draftNumber !== b.draftNumber) {
      return b.draftNumber - a.draftNumber;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

    return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Draft Reports
        </h2>
        <p className="text-gray-600">
          View and respond to draft reports (Word/PDF) from the admin. Upload your revised versions to continue the review process.
        </p>
      </div>

      {/* Response Form */}
      {showResponseForm && selectedDraft && (
        <div className="mb-8 card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Reply className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Upload Draft #{selectedDraft.draftNumber + 1}
            </h3>
          </div>
          <form onSubmit={handleRespondToDraft} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Your Revised Draft (Word/PDF)
              </label>
              <input
                type="file"
                required
                accept=".docx,.doc,.pdf"
                onChange={handleFileChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload your revised version with changes and improvements
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Comments & Changes Made
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Describe the changes you made, improvements, or any questions for the admin..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={responding || !selectedFile}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {responding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
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
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drafts List */}
      <div className="space-y-6">
        {sortedDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Reports Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Draft reports will appear here when the admin creates them from your approved uploads. 
              You'll be able to review and respond with your revisions.
            </p>
          </div>
        ) : (
          sortedDrafts.map((draft) => (
            <div
              key={draft.id}
              className="card p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      draft.draftType === "ADMIN_TO_USER" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600" 
                        : "bg-gradient-to-r from-green-600 to-emerald-600"
                    }`}>
                      {draft.draftType === "ADMIN_TO_USER" ? (
                        <Download className="h-4 w-4 text-white" />
                      ) : (
                        <Upload className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Draft #{draft.draftNumber} - {draft.fileName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-medium">Template:</span> {draft.template.name}</p>
                      <p><span className="font-medium">Financial Year:</span> {draft.financialYear}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Created:</span> {new Date(draft.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Size:</span> {formatFileSize(draft.fileSize)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Based on:</span> {draft.originalUpload.fileName}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getDraftTypeColor(draft.draftType)}`}>
                    {draft.draftType === "ADMIN_TO_USER" ? "From Admin" : "Your Response"}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                    {draft.status}
                  </span>
                </div>
              </div>
              
              {draft.comments && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Comments:</span> {draft.comments}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <a
                  href={draft.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </a>
                <a
                  href={draft.fileUrl}
                  download
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
                {draft.draftType === "ADMIN_TO_USER" && draft.status === "PENDING_REVIEW" && (
                  <button
                    onClick={() => {
                      setSelectedDraft(draft);
                      setShowResponseForm(true);
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Upload Draft #{draft.draftNumber + 1}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
