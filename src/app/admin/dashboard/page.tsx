"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Users, FileText, Activity, Upload, Download } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user?.name || "Admin"}
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
