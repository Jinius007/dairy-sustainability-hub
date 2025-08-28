"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Download, Upload, FileText, History, User } from "lucide-react";
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-900 bg-clip-text text-transparent mb-1">
                  Dairy Sustainability Reporting Hub
                </h1>
                <p className="text-lg text-gray-600 font-medium">User Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Welcome, {session.user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500">Member</p>
              </div>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="btn-secondary text-base px-6 py-3"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card overflow-hidden shadow-2xl">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <nav className="flex space-x-2 p-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-white text-green-600 shadow-lg border-2 border-green-200 transform scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/70 hover:shadow-md"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
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
