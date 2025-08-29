"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, Download, Trash2, History, RefreshCw } from "lucide-react";

interface Template {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  version: number;
  previousVersionId?: string;
}

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    financialYear: new Date().getFullYear().toString(),
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replacingTemplate, setReplacingTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      let url = "/api/templates";
      if (showHistory && selectedFinancialYear) {
        url += `?includeHistory=true&financialYear=${selectedFinancialYear}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
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
    formDataToSend.append("name", formData.name);
    formDataToSend.append("financialYear", formData.financialYear);
    formDataToSend.append("description", formData.description);

    if (replacingTemplate) {
      formDataToSend.append("replaceExisting", "true");
      formDataToSend.append("existingTemplateId", replacingTemplate);
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setFormData({ 
          name: "", 
          financialYear: new Date().getFullYear().toString(),
          description: ""
        });
        setSelectedFile(null);
        setReplacingTemplate(null);
        fetchTemplates();
        alert(replacingTemplate ? "Template replaced successfully!" : "Template uploaded successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      alert("Error uploading template. Please try again.");
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

  const handleReplaceTemplate = (templateId: string, templateName: string) => {
    setReplacingTemplate(templateId);
    setFormData(prev => ({
      ...prev,
      name: templateName
    }));
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template? This will make it inactive and no longer visible to users.")) {
      return;
    }

    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTemplates();
        alert("Template deleted successfully!");
      } else {
        alert("Error deleting template. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting template. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-red-100 text-red-800 border-red-200";
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Template Management</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload and manage sustainability report templates. When you replace a template, the old version becomes inactive and is no longer visible to users.
        </p>
      </div>

      {/* Template Upload Form */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-md font-medium text-gray-900 mb-4">
          {replacingTemplate ? "Replace Existing Template" : "Upload New Template"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Sustainability Report Template 2024"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Excel File</label>
              <input
                type="file"
                required
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Template description..."
            />
          </div>

          <div className="flex space-x-2">
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
              <span>{uploading ? "Uploading..." : (replacingTemplate ? "Replace Template" : "Upload Template")}</span>
            </button>
            {replacingTemplate && (
              <button
                type="button"
                onClick={() => {
                  setReplacingTemplate(null);
                  setFormData({ 
                    name: "", 
                    financialYear: new Date().getFullYear().toString(),
                    description: ""
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel Replace
              </button>
            )}
          </div>
        </form>
      </div>

      {/* View Options */}
      <div className="mb-4 flex items-center space-x-4">
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) {
              setSelectedFinancialYear(new Date().getFullYear().toString());
            }
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            showHistory 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <History className="h-4 w-4" />
          <span>{showHistory ? "Hide History" : "Show History"}</span>
        </button>
        
        {showHistory && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Financial Year:</label>
            <input
              type="text"
              value={selectedFinancialYear}
              onChange={(e) => setSelectedFinancialYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              placeholder="2024"
            />
            <button
              onClick={fetchTemplates}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Load</span>
            </button>
          </div>
        )}
      </div>

      {/* Templates Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financial Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  {showHistory ? "No template history found for this financial year." : "No templates found. Upload your first template."}
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.fileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.financialYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    v{template.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(template.isActive)}`}>
                      {template.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(template.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={template.fileUrl}
                        download
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Download template"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {template.isActive && (
                        <button
                          onClick={() => handleReplaceTemplate(template.id, template.name)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Replace template"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
