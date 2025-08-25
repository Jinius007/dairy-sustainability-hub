"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Eye, Calendar } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "template" | "draft" | "final";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  createdAt: string;
  status?: string;
  isFinal?: boolean;
}

export default function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Fetch templates, drafts, and final reports for the last 3 years
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1, currentYear - 2];
      
      const allHistory: HistoryItem[] = [];

      // Fetch templates
      const templatesResponse = await fetch("/api/templates");
      if (templatesResponse.ok) {
        const templates = await templatesResponse.json();
        templates.forEach((template: any) => {
          if (years.includes(parseInt(template.financialYear))) {
            allHistory.push({
              ...template,
              type: "template" as const,
            });
          }
        });
      }

      // Fetch drafts
      const draftsResponse = await fetch("/api/drafts");
      if (draftsResponse.ok) {
        const drafts = await draftsResponse.json();
        drafts.forEach((draft: any) => {
          if (years.includes(parseInt(draft.financialYear))) {
            allHistory.push({
              ...draft,
              type: "draft" as const,
            });
          }
        });
      }

      // Sort by year (descending) and then by creation date
      allHistory.sort((a, b) => {
        if (a.financialYear !== b.financialYear) {
          return b.financialYear.localeCompare(a.financialYear);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setHistory(allHistory);
      
      if (allHistory.length > 0) {
        setSelectedYear(allHistory[0].financialYear);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
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

  const filteredHistory = selectedYear
    ? history.filter((item) => item.financialYear === selectedYear)
    : history;

  const availableYears = [...new Set(history.map((item) => item.financialYear))].sort(
    (a, b) => b.localeCompare(a)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-green-100 text-green-800";
      case "final":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "template":
        return "Template";
      case "draft":
        return "Draft";
      case "final":
        return "Final Report";
      default:
        return type;
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Previous Years History</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Financial Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No history available for the selected year.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{item.fileName}</h3>
                  <p className="text-sm text-gray-600">
                    {getTypeLabel(item.type)} - {item.financialYear}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      item.type
                    )}`}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                  {item.isFinal && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      FINAL
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Size: {formatFileSize(item.fileSize)}</p>
                  <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex space-x-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={item.fileUrl}
                    download
                    className="text-green-600 hover:text-green-900 p-1"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
