"use client";

import { useState } from "react";

export default function SetupPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    setStatus("Setting up database...");

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ ${data.message}`);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Database Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up the database with admin and user accounts
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={setupDatabase}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Setup Database"}
          </button>

          {status && (
            <div className="text-center">
              <p className="text-sm">{status}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              After setup, you can login with:
            </p>
            <p className="text-xs text-gray-500">
              Admin: username: admin, password: password
            </p>
            <p className="text-xs text-gray-500">
              Users: username: john/jane, password: password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
