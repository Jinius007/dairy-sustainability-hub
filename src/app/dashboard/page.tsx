"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Download, Upload, FileText, History } from "lucide-react";
import TemplateDownload from "@/components/user/TemplateDownload";
import UploadFilledTemplate from "@/components/user/UploadFilledTemplate";
import DraftManagement from "@/components/user/DraftManagement";
import DraftReports from "@/components/user/DraftReports";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("templates");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
    } else if (session.user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role === "ADMIN") {
    return null;
  }

  const tabs = [
    { id: "templates", label: "Download Templates", icon: Download },
    { id: "upload", label: "Upload Filled Data", icon: Upload },
    { id: "drafts", label: "My Uploads", icon: FileText },
    { id: "history", label: "Draft Reports", icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                User Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user?.name || "User"}
              </span>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "templates" && <TemplateDownload />}
            {activeTab === "upload" && <UploadFilledTemplate />}
            {activeTab === "drafts" && <DraftManagement />}
            {activeTab === "history" && <DraftReports />}
          </div>
        </div>
      </div>
    </div>
  );
}
