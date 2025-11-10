"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import { Brain, Plus, Folder, Settings, LogOut, Loader2, Calendar, TrendingUp, Sparkles } from "lucide-react";

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
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Parallax Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20" />
        
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-8"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/minimalist-data-science-workspace-illust-05e224b6-20251110172317.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b-2 border-border bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">NLU ML Platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <button className="p-2.5 hover:bg-primary/10 rounded-xl transition-all hover:scale-110">
                <Settings className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <button onClick={handleSignOut} className="p-2.5 hover:bg-red-50 rounded-xl transition-all hover:scale-110 group">
              <LogOut className="w-5 h-5 text-foreground group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back, {session.user.name || session.user.email || "User"}!
            </h1>
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your NLU and ML workspaces, train models, and build intelligent chatbots.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Folder, label: "Total Workspaces", value: workspaces.length, gradient: "from-blue-500 to-cyan-500" },
            { icon: Brain, label: "Active Projects", value: workspaces.length, gradient: "from-purple-500 to-pink-500" },
            { icon: TrendingUp, label: "Models Trained", value: 0, gradient: "from-green-500 to-emerald-500" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white border-2 border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all hover:-translate-y-1"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workspaces Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Your Workspaces</h2>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-primary/30 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Folder className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first workspace to start building intelligent chatbots
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
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
                  className="bg-white border-2 border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full group hover:-translate-y-2"
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Folder className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate text-foreground group-hover:text-primary transition-colors">{workspace.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {workspace.description || "No description provided"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-primary/20 rounded-3xl max-w-md w-full p-8 shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <h2 className="text-3xl font-bold text-foreground mb-6">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Workspace Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="My NLU Project"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
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
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspace.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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