"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Brain, Plus, Trash2, Calendar, FolderOpen, Loader2, LogOut, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newWorkspace = await response.json();
        toast.success("Workspace created successfully!");
        setShowCreateModal(false);
        setName("");
        setDescription("");
        router.push(`/workspace/${newWorkspace.id}`);
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Workspace deleted successfully");
        fetchWorkspaces();
      } else {
        toast.error("Failed to delete workspace");
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast.error("An error occurred");
    }
  };

  const handleSignOut = async () => {
    const { authClient } = await import("@/lib/auth-client");
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      router.push("/");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Professional Background - Properly Positioned */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-pink-50/20" />
        
        {/* Top right illustration - contained */}
        <div 
          className="absolute top-20 right-10 w-[450px] h-[350px] opacity-[0.06]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/minimalist-data-science-workspace-illust-05e224b6-20251110172317.jpg')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />

        {/* Bottom left illustration - contained */}
        <div 
          className="absolute bottom-20 left-10 w-[400px] h-[300px] opacity-[0.05]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/workspace-and-project-management-illustr-f847cbbe-20251110154558.jpg')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        />

        {/* Center subtle pattern */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-[0.03]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-9f595ec8-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
          }}
        />

        {/* Gradient orbs - properly positioned */}
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="border-b-2 border-border bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">NLU ML Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-foreground">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border-2 border-red-200 rounded-xl transition-all hover:shadow-md"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Stats */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-border rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-200 rounded-full mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">AI-Powered Platform</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
                  Welcome back, {session.user.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                  Manage your ML workspaces and build intelligent chatbots
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{workspaces.length}</p>
                  <p className="text-xs text-muted-foreground font-semibold">Workspaces</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground font-semibold">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Workspaces</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">Create and manage ML projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-md transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              New Workspace
            </button>
          </div>

          {workspaces.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl p-12 text-center shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No workspaces yet</h3>
                <p className="text-muted-foreground mb-6 font-medium">
                  Get started by creating your first workspace to organize your ML projects and chatbots.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-md transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Create First Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-white/90 backdrop-blur-sm border-2 border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
                >
                  {/* Card Header with Gradient */}
                  <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="p-2 hover:bg-red-50 border-2 border-transparent hover:border-red-200 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {workspace.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-medium">
                      {workspace.description || "No description provided"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform group-hover:scale-105"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-border">
            <div className="p-6 border-b-2 border-border">
              <h2 className="text-2xl font-bold text-foreground">Create New Workspace</h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Set up a new ML project workspace</p>
            </div>
            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Customer Support Bot"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your workspace purpose..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-medium"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setName("");
                    setDescription("");
                  }}
                  className="flex-1 px-4 py-3 bg-white border-2 border-border text-foreground rounded-xl font-bold hover:bg-gray-50 transition-all"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
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