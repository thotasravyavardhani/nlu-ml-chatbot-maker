"use client";

import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Brain, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectTo = searchParams.get("redirect") || "/dashboard";

    try {
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result.error) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        setIsLoading(false);
        return;
      }

      // Refetch session to ensure it's established
      await refetch();
      
      toast.success("Welcome back!");
      
      // Small delay to ensure session is fully propagated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use router.push for proper Next.js navigation with session
      router.push(redirectTo);
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-blue-50 via-purple-50/40 to-pink-50/30">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          {/* Logo Section */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">NLU Studio</span>
            </Link>
          </div>

          <div className="bg-white border-2 border-primary/20 rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="off"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-3 text-sm font-medium text-foreground cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">
                  Create one
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-border">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-900 mb-2">Demo Account</p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><span className="font-semibold">Email:</span> demo@nluapp.com</p>
                  <p><span className="font-semibold">Password:</span> demo123456</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="relative z-10 max-w-lg" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-3 shadow-2xl">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-professional-nlu-ml-platform-dash-3441cf8f-20251110175143.jpg"
              alt="NLU ML Platform"
              width={600}
              height={500}
              className="rounded-2xl w-full h-auto"
            />
          </div>
          <div className="text-center mt-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Build Intelligent Chatbots</h2>
            <p className="text-white/90 text-lg font-medium">
              Harness the power of ML and NLU to create advanced conversational AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}