"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Brain, Database, Zap, BarChart3, MessageSquare, Settings as SettingsIcon, FileText, Download, RefreshCw, ArrowLeft, Menu, X, Loader2, Target, Sparkles } from "lucide-react";
import DatasetManager from "@/components/workspace/DatasetManager";
import ModelTraining from "@/components/workspace/ModelTraining";
import ModelEvaluation from "@/components/workspace/ModelEvaluation";
import ModelPrediction from "@/components/workspace/ModelPrediction";
import NLUChatbot from "@/components/workspace/NLUChatbot";
import AnnotationTool from "@/components/workspace/AnnotationTool";
import ModelMetadata from "@/components/workspace/ModelMetadata";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
}

type TabType = "dataset" | "train" | "predict" | "evaluation" | "nlu-chatbot" | "annotation" | "metadata";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dataset");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchWorkspace();
    }
  }, [params.id, session]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/workspaces/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "dataset" as TabType, label: "Dataset Upload", icon: Database, description: "Upload & manage CSV/JSON/YML files", gradient: "from-blue-500 to-cyan-500" },
    { id: "train" as TabType, label: "Train Models", icon: Zap, description: "Multi-algorithm ML training", gradient: "from-purple-500 to-pink-500" },
    { id: "predict" as TabType, label: "Predict & Test", icon: Target, description: "Test models with new data", gradient: "from-orange-500 to-red-500" },
    { id: "evaluation" as TabType, label: "Model Evaluation", icon: BarChart3, description: "Metrics, charts & confusion matrix", gradient: "from-green-500 to-emerald-500" },
    { id: "metadata" as TabType, label: "Model Info", icon: SettingsIcon, description: "Download & retrain models", gradient: "from-indigo-500 to-blue-500" },
    { id: "nlu-chatbot" as TabType, label: "NLU Chatbot", icon: MessageSquare, description: "RASA-powered chatbot", gradient: "from-violet-500 to-purple-500" },
    { id: "annotation" as TabType, label: "Annotation Tool", icon: FileText, description: "Label intents & entities", gradient: "from-pink-500 to-rose-500" },
  ];

  const getBackgroundForTab = (tab: TabType) => {
    const backgrounds = {
      dataset: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-2322345f-20251110172252.jpg",
      train: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/ai-brain-neural-network-visualization-wi-67c49341-20251110172252.jpg",
      predict: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/data-science-workspace-abstract-backgrou-7ba70d77-20251110172252.jpg",
      evaluation: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-2322345f-20251110172252.jpg",
      metadata: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/ai-brain-neural-network-visualization-wi-67c49341-20251110172252.jpg",
      "nlu-chatbot": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/data-science-workspace-abstract-backgrou-7ba70d77-20251110172252.jpg",
      annotation: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-2322345f-20251110172252.jpg"
    };
    return backgrounds[tab];
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !workspace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background with Parallax */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${getBackgroundForTab(activeTab)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">{workspace.name}</h1>
                <p className="text-xs text-slate-400">{workspace.description || "AI/ML Workspace"}</p>
              </div>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar with Glassmorphism */}
        <aside className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 transition-transform z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}>
          <div className="h-full backdrop-blur-xl bg-slate-950/40 border-r border-white/10">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      isActive
                        ? "scale-105"
                        : "hover:scale-102"
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20`} />
                    )}
                    <div className={`relative flex items-start gap-3 px-4 py-4 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 border-white/20 backdrop-blur-sm"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-br ${item.gradient}` 
                          : "bg-white/10 group-hover:bg-white/20"
                      }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-300"}`} />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-semibold text-sm mb-1 ${isActive ? "text-white" : "text-slate-200"}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse absolute top-2 right-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10 mt-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs font-medium text-slate-300">Backend Status</p>
                </div>
                <p className="text-xs text-slate-400">Python ML & RASA services connected</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content with Glassmorphism Cards */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Content Card with Glassmorphism */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Tab Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const currentItem = menuItems.find(item => item.id === activeTab);
                    if (!currentItem) return null;
                    return (
                      <>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentItem.gradient} flex items-center justify-center shadow-lg`}>
                          <currentItem.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{currentItem.label}</h2>
                          <p className="text-sm text-slate-400">{currentItem.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "dataset" && <DatasetManager workspaceId={params.id as string} />}
                {activeTab === "train" && <ModelTraining workspaceId={params.id as string} />}
                {activeTab === "predict" && <ModelPrediction workspaceId={params.id as string} />}
                {activeTab === "evaluation" && <ModelEvaluation workspaceId={params.id as string} />}
                {activeTab === "nlu-chatbot" && <NLUChatbot workspaceId={params.id as string} />}
                {activeTab === "annotation" && <AnnotationTool workspaceId={params.id as string} />}
                {activeTab === "metadata" && <ModelMetadata workspaceId={params.id as string} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}