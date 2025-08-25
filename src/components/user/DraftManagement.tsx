"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Upload, Eye, Check } from "lucide-react";

interface Draft {
  id: string;
  draftNumber: number;
  draftType: "ADMIN" | "USER";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  isFinal: boolean;
  createdAt: string;
}

export default function DraftManagement() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    draftNumber: 1,
    financialYear: new Date().getFullYear().toString(),
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile);
    formDataToSend.append("draftNumber", formData.draftNumber.toString());
    formDataToSend.append("draftType", "USER");
    formDataToSend.append("financialYear", formData.financialYear);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setFormData({
          draftNumber: 1,
          financialYear: new Date().getFullYear().toString(),
        });
        setSelectedFile(null);
        fetchDrafts();
        alert("Draft uploaded successfully!");
      } else {
        alert("Error uploading draft. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading draft:", error);
      alert("Error uploading draft. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAcceptFinal = async (draftId: string) => {
    if (!confirm("Are you sure you want to accept this as the final report?")) return;

    try {
      const response = await fetch(`/api/drafts/${draftId}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        fetchDrafts();
        alert("Draft accepted as final!");
      }
    } catch (error) {
      console.error("Error accepting draft:", error);
      alert("Error accepting draft. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const sortedDrafts = drafts.sort((a, b) => {
    if (a.financialYear !== b.financialYear) {
      return b.financialYear.localeCompare(a.financialYear);
    }
    return b.draftNumber - a.draftNumber;
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Draft Management</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Draft Number</label>
              <input
                type="number"
                required
                min="1"
                value={formData.draftNumber}
                onChange={(e) => setFormData({ ...formData, draftNumber: parseInt(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Financial Year</label>
              <input
                type="text"
                required
                value={formData.financialYear}
                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2024"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Your Draft</label>
            <input
              type="file"
              required
              accept=".xlsx,.xls,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Draft"}</span>
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {sortedDrafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No drafts available yet.</p>
          </div>
        ) : (
          sortedDrafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Draft {draft.draftNumber} ({draft.draftType})
                  </h3>
                  <p className="text-sm text-gray-600">{draft.fileName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      draft.isFinal
                        ? "bg-purple-100 text-purple-800"
                        : draft.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {draft.isFinal ? "FINAL" : draft.status}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {draft.financialYear}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Size: {formatFileSize(draft.fileSize)}</p>
                  <p>Created: {new Date(draft.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex space-x-2">
                  <a
                    href={draft.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={draft.fileUrl}
                    download
                    className="text-green-600 hover:text-green-900 p-1"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {draft.draftType === "ADMIN" && !draft.isFinal && (
                    <button
                      onClick={() => handleAcceptFinal(draft.id)}
                      className="text-purple-600 hover:text-purple-900 p-1"
                      title="Accept as Final"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
