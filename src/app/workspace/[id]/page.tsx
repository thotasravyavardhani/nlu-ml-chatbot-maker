"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Brain, Database, Zap, BarChart3, MessageSquare, Settings as SettingsIcon, FileText, Download, RefreshCw, ArrowLeft, Menu, X, Loader2, Target } from "lucide-react";
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
  const mainRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setScrollY(mainRef.current.scrollTop);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

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
    { id: "predict" as TabType, label: "Predict & Test", icon: Target, description: "Test models with new data", gradient: "from-green-500 to-emerald-500" },
    { id: "evaluation" as TabType, label: "Model Evaluation", icon: BarChart3, description: "Metrics, charts & confusion matrix", gradient: "from-orange-500 to-red-500" },
    { id: "metadata" as TabType, label: "Model Info", icon: SettingsIcon, description: "Download & retrain models", gradient: "from-indigo-500 to-purple-500" },
    { id: "nlu-chatbot" as TabType, label: "NLU Chatbot", icon: MessageSquare, description: "RASA-powered chatbot", gradient: "from-teal-500 to-cyan-500" },
    { id: "annotation" as TabType, label: "Annotation Tool", icon: FileText, description: "Label intents & entities", gradient: "from-pink-500 to-rose-500" },
  ];

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary Background Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        
        {/* Neural Network Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-9f595ec8-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.15}px) scale(1.1)`,
          }}
        />

        {/* Data Science Workspace Illustration */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-20"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/minimalist-data-science-workspace-illust-05e224b6-20251110172317.jpg')`,
            backgroundSize: 'contain',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        />

        {/* AI Brain Network - Bottom Left */}
        <div 
          className="absolute bottom-0 left-0 w-1/3 h-2/3 opacity-15"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-artificial-intelligence-brain-n-872b5f5a-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left bottom',
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        />

        {/* Gradient Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
        
        {/* Animated Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      {/* Header with Glass Effect */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            </button>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative">
                <h1 className="font-bold text-lg text-white">{workspace.name}</h1>
                <p className="text-xs text-slate-400">{workspace.description || "No description"}</p>
              </div>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar with Glass Morphism */}
        <aside 
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl transition-transform z-40 overflow-y-auto shadow-2xl`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? "scale-105"
                    : "hover:scale-102"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} transition-opacity duration-300 ${
                  activeTab === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-10"
                }`} />
                
                {/* Glass Effect Border */}
                <div className={`absolute inset-0 rounded-xl border transition-colors duration-300 ${
                  activeTab === item.id 
                    ? "border-white/30 shadow-lg shadow-white/10" 
                    : "border-white/5 group-hover:border-white/20"
                }`} />
                
                {/* Content */}
                <div className="relative flex items-start gap-4 px-4 py-4">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-white/20 shadow-lg"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-semibold text-sm transition-colors duration-300 ${
                      activeTab === item.id ? "text-white" : "text-slate-300 group-hover:text-white"
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      activeTab === item.id ? "text-white/80" : "text-slate-500 group-hover:text-slate-400"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area with Scroll Container */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] relative"
        >
          <div className="p-6 lg:p-8 min-h-full">
            {/* Content Card with Glass Effect */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-6 lg:p-8">
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