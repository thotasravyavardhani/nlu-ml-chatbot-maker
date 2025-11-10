"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Brain, Database, Zap, BarChart3, MessageSquare, Settings as SettingsIcon, FileText, ArrowLeft, Menu, X, Loader2, Target } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !workspace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20">
      {/* Header */}
      <header className="border-b-2 border-border bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-300 hover:scale-110 group"
            >
              <ArrowLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">{workspace.name}</h1>
                <p className="text-xs text-muted-foreground">{workspace.description || "No description"}</p>
              </div>
            </div>
          </div>
          <button 
            className="lg:hidden p-2.5 hover:bg-primary/10 rounded-xl transition-all" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 border-r-2 border-border bg-white/90 backdrop-blur-xl transition-transform z-40 overflow-y-auto shadow-lg`}
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
                    ? "scale-105 shadow-lg"
                    : "hover:scale-102 hover:shadow-md"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} transition-opacity duration-300 ${
                  activeTab === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-10"
                }`} />
                
                {/* Border */}
                <div className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300 ${
                  activeTab === item.id 
                    ? "border-primary/50 shadow-md" 
                    : "border-border group-hover:border-primary/30"
                }`} />
                
                {/* Content */}
                <div className="relative flex items-start gap-4 px-4 py-4">
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-white/30 shadow-md"
                      : "bg-white/50 group-hover:bg-white/70"
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === item.id ? "text-white" : "text-foreground group-hover:text-primary"
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-bold text-sm transition-colors duration-300 ${
                      activeTab === item.id ? "text-white" : "text-foreground group-hover:text-primary"
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      activeTab === item.id ? "text-white/90" : "text-muted-foreground group-hover:text-muted-foreground"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]"
        >
          <div className="p-6 lg:p-8 min-h-full">
            <div className="bg-white border-2 border-border rounded-2xl shadow-lg overflow-hidden">
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