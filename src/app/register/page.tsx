"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Brain, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // NEVER use callbackURL - handle redirect manually
      const result = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (result.error?.code) {
        const errorMessages: Record<string, string> = {
          USER_ALREADY_EXISTS: "An account with this email already exists",
        };
        toast.error(errorMessages[result.error.code] || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success - manually redirect
      toast.success("Account created successfully! Please sign in.");
      setTimeout(() => {
        window.location.href = "/login?registered=true";
      }, 100);
      
    } catch (err) {
      toast.error("An error occurred during registration");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-purple-50 via-pink-50/40 to-blue-50/30">
      {/* Left Side - Professional Image */}
      <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="relative z-10 max-w-lg" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-3 shadow-2xl">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/professional-illustration-of-multiple-ai-2417632d-20251110175143.jpg"
              alt="AI Training"
              width={600}
              height={500}
              className="rounded-2xl w-full h-auto"
            />
          </div>
          <div className="text-center mt-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Start Your AI Journey</h2>
            <p className="text-white/90 text-lg font-medium">
              Train multiple ML algorithms and build powerful NLU chatbots
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          {/* Logo Section */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">NLU ML Platform</span>
            </Link>
          </div>

          <div className="bg-white border-2 border-primary/20 rounded-3xl shadow-2xl p-8">
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

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}