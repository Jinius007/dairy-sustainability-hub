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
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Draft Reports</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and respond to draft reports from the admin. You can download drafts, review them, and submit your responses.
        </p>
      </div>

      {/* Response Form */}
      {showResponseForm && selectedDraft && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Respond to Draft #{selectedDraft.draftNumber}
          </h3>
          <form onSubmit={handleRespondToDraft} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Response
              </label>
              <input
                type="file"
                required
                accept=".xlsx,.xls"
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
                placeholder="Add your comments or feedback..."
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
                  <Reply className="h-4 w-4" />
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
      )}

      {/* Drafts List */}
      <div className="space-y-4">
        {sortedDrafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No draft reports found. Drafts will appear here when the admin creates them from your approved uploads.</p>
          </div>
        ) : (
          sortedDrafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Draft #{draft.draftNumber} - {draft.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Template: {draft.template.name} | Financial Year: {draft.financialYear}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(draft.createdAt).toLocaleDateString()} | 
                    Size: {formatFileSize(draft.fileSize)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Based on: {draft.originalUpload.fileName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDraftTypeColor(draft.draftType)}`}>
                    {draft.draftType === "ADMIN_TO_USER" ? "From Admin" : "Your Response"}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                    {draft.status}
                  </span>
                </div>
              </div>
              
              {draft.comments && (
                <div className="mb-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Comments:</strong> {draft.comments}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <a
                  href={draft.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </a>
                <a
                  href={draft.fileUrl}
                  download
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
                {draft.draftType === "ADMIN_TO_USER" && draft.status === "PENDING_REVIEW" && (
                  <button
                    onClick={() => {
                      setSelectedDraft(draft);
                      setShowResponseForm(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Respond
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
