"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, Lock, User } from "lucide-react";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        setError("Invalid username or password");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Network error or server issue. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Dairy Sustainability Reporting Hub
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Sign In Form */}
        <div className="card p-8 shadow-2xl border-2 border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-lg font-semibold text-gray-700 mb-3">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field pl-12 text-lg"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field pl-12 text-lg"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Lock className="h-6 w-6" />
              )}
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><span className="font-semibold">Admin:</span> admin / password</p>
              <p><span className="font-semibold">User (John):</span> john / password</p>
              <p><span className="font-semibold">User (Jane):</span> jane / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
