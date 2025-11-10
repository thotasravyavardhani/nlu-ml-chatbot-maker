"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Brain, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    const { error: authError } = await authClient.signUp.email({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    });

    if (authError?.code) {
      const errorMessages: Record<string, string> = {
        USER_ALREADY_EXISTS: "An account with this email already exists",
      };
      setError(errorMessages[authError.code] || "Registration failed. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Parallax Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient - light and airy */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50/40 to-blue-50/30" />
        
        {/* Floating AI elements */}
        <div 
          className="absolute top-20 left-20 w-64 h-64 opacity-10"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-artificial-intelligence-brain-n-872b5f5a-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.1}px)`,
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        
        {/* Data visualization top right */}
        <div 
          className="absolute top-20 right-20 w-72 h-72 opacity-8"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/minimalist-data-science-workspace-illust-05e224b6-20251110172317.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * -0.1}px)`,
            animation: 'float 7s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">NLU ML Platform</span>
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border-2 border-primary/20 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start building intelligent chatbots today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="off"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}