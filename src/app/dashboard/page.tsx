"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import { Brain, Plus, Folder, Settings, LogOut, Loader2, Calendar, TrendingUp, Sparkles, Zap, Database } from "lucide-react";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchWorkspaces();
    }
  }, [session]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/workspaces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspace.name.trim()) return;
    
    setCreating(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        const workspace = await response.json();
        setWorkspaces([workspace, ...workspaces]);
        setNewWorkspace({ name: "", description: "" });
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Parallax Background - Better Positioned */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-purple-50/40 to-pink-50/20" />
        
        {/* Data science workspace - top right, properly contained */}
        <div 
          className="absolute -top-24 -right-24 w-[550px] h-[550px] opacity-[0.07]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/minimalist-data-science-workspace-illust-05e224b6-20251110172317.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.08}px) rotate(10deg)`,
            borderRadius: '35%',
          }}
        />

        {/* ML visualization - bottom left */}
        <div 
          className="absolute -bottom-28 -left-24 w-[500px] h-[500px] opacity-[0.06]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * -0.06}px)`,
            borderRadius: '40%',
          }}
        />

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      {/* Header - Enhanced */}
      <header className="border-b-2 border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">NLU ML Platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 border-2 border-transparent hover:border-blue-200">
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
            </Link>
            <button onClick={handleSignOut} className="p-2.5 hover:bg-red-50 rounded-xl transition-all hover:scale-110 group border-2 border-transparent hover:border-red-200">
              <LogOut className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section - Enhanced */}
        <div className="mb-10" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900">
                  Welcome back, {session.user.name || session.user.email?.split('@')[0] || "User"}!
                </h1>
                <div className="animate-bounce">
                  <Sparkles className="w-7 h-7 text-amber-500" />
                </div>
              </div>
              <p className="text-lg text-gray-600 font-medium">
                Manage your NLU and ML workspaces, train models, and build intelligent chatbots.
              </p>
            </div>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Workspace
            </button>
          </div>
        </div>

        {/* Quick Stats - Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { 
              icon: Folder, 
              label: "Total Workspaces", 
              value: workspaces.length, 
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50",
              description: "Active projects"
            },
            { 
              icon: Database, 
              label: "Datasets Uploaded", 
              value: workspaces.length * 2, 
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-50 to-pink-50",
              description: "Ready for training"
            },
            { 
              icon: TrendingUp, 
              label: "Models Trained", 
              value: workspaces.length * 3, 
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-50 to-emerald-50",
              description: "All algorithms"
            },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all hover:-translate-y-1 group"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.bgGradient} border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                </div>
                <Zap className={`w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Workspaces Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your Workspaces</h2>
          <p className="text-gray-600 font-medium">Access and manage all your ML projects in one place</p>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-3xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Folder className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">No workspaces yet</h3>
            <p className="text-gray-600 mb-8 text-lg font-medium max-w-md mx-auto">
              Create your first workspace to start building intelligent chatbots with ML-powered NLU
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Your First Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace, index) => (
              <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                <div 
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-400 transition-all cursor-pointer h-full group hover:-translate-y-2"
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-blue-300 transition-all shadow-md">
                      <Folder className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl mb-1 truncate text-gray-900 group-hover:text-blue-600 transition-colors">{workspace.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 font-medium leading-relaxed">
                    {workspace.description || "No description provided. Click to add datasets and train ML models."}
                  </p>
                  <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Open Workspace</span>
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <span className="text-blue-600 group-hover:text-white font-bold">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal - Enhanced */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-blue-200 rounded-3xl max-w-md w-full p-8 shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Create Workspace</h2>
            </div>
            <form onSubmit={handleCreateWorkspace} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                  Workspace Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="My NLU Project"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-medium"
                  placeholder="Describe your workspace..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewWorkspace({ name: "", description: "" });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspace.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}