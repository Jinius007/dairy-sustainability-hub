"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Users, FileText, Activity, Upload, Download, Building2 } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import TemplateManagement from "@/components/admin/TemplateManagement";
import ActivityLogs from "@/components/admin/ActivityLogs";
import UserUploadsManagement from "@/components/admin/UserUploadsManagement";
import DraftReportsManagement from "@/components/admin/DraftReportsManagement";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
    } else if (session.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  const tabs = [
    { id: "users", label: "User Management", icon: Users },
    { id: "templates", label: "Template Management", icon: FileText },
    { id: "user-uploads", label: "User Filled Templates", icon: Download },
    { id: "draft-reports", label: "Draft Reports", icon: Upload },
    { id: "activity", label: "Activity Logs", icon: Activity },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-1">
                  Dairy Sustainability Reporting Hub
                </h1>
                <p className="text-lg text-gray-600 font-medium">Administrative Control Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Welcome, {session.user?.name || "Admin"}
                </p>
                <p className="text-sm text-gray-500">System Administrator</p>
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
                        ? "bg-white text-blue-600 shadow-lg border-2 border-blue-200 transform scale-105"
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
            {activeTab === "users" && <UserManagement />}
            {activeTab === "templates" && <TemplateManagement />}
            {activeTab === "user-uploads" && <UserUploadsManagement />}
            {activeTab === "draft-reports" && <DraftReportsManagement />}
            {activeTab === "activity" && <ActivityLogs />}
          </div>
        </div>
      </div>
    </div>
  );
}
