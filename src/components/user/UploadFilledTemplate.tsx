"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  fileName: string;
  financialYear: string;
}

export default function UploadFilledTemplate() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    templateId: "",
    financialYear: new Date().getFullYear().toString(),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
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
    if (!selectedFile || !formData.templateId) return;

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile);
    formDataToSend.append("templateId", formData.templateId);
    formDataToSend.append("financialYear", formData.financialYear);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setFormData({
          templateId: "",
          financialYear: new Date().getFullYear().toString(),
        });
        setSelectedFile(null);
        alert("Template uploaded successfully!");
      } else {
        alert("Error uploading template. Please try again.");
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

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setFormData({
      templateId,
      financialYear: template?.financialYear || new Date().getFullYear().toString(),
    });
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Filled Template</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                required
                value={formData.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.financialYear})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year
              </label>
              <input
                type="text"
                required
                value={formData.financialYear}
                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2024"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Filled Template
            </label>
            <input
              type="file"
              required
              accept=".xlsx,.xls,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: Excel (.xlsx, .xls), PDF (.pdf), Word (.doc, .docx)
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile || !formData.templateId}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Template"}</span>
          </button>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Instructions</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Download the blank template from the "Download Templates" tab</li>
              <li>• Fill in all required data in the template</li>
              <li>• Save the file and upload it here</li>
              <li>• The admin will review your submission and create a draft report</li>
              <li>• You can track the progress in the "Draft Management" tab</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
