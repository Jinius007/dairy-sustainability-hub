"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Eye } from "lucide-react";

interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  createdAt: string;
  template: {
    name: string;
    financialYear: string;
  };
}

export default function DraftManagement() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch("/api/upload");
      if (response.ok) {
        const data = await response.json();
        setUploads(data);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
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
      default:
        return "bg-yellow-100 text-yellow-800";
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Uploads</h2>
        <p className="text-sm text-gray-600 mb-4">
          View your uploaded sustainability reports and their current status.
        </p>
      </div>

      <div className="space-y-4">
        {uploads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No uploads found. Upload your filled template to see it here.</p>
          </div>
        ) : (
          uploads.map((upload) => (
            <div
              key={upload.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{upload.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    Template: {upload.template.name} | Financial Year: {upload.financialYear}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(upload.createdAt).toLocaleDateString()} | 
                    Size: {formatFileSize(upload.fileSize)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(upload.status)}`}>
                    {upload.status}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <a
                  href={upload.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </a>
                <a
                  href={upload.fileUrl}
                  download
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
