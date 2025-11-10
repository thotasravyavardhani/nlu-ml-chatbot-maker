"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    { id: "dataset" as TabType, label: "Dataset Upload", icon: Database, description: "Upload & manage CSV/JSON/YML files" },
    { id: "train" as TabType, label: "Train Models", icon: Zap, description: "Multi-algorithm ML training" },
    { id: "predict" as TabType, label: "Predict & Test", icon: Target, description: "Test models with new data" },
    { id: "evaluation" as TabType, label: "Model Evaluation", icon: BarChart3, description: "Metrics, charts & confusion matrix" },
    { id: "metadata" as TabType, label: "Model Info", icon: SettingsIcon, description: "Download & retrain models" },
    { id: "nlu-chatbot" as TabType, label: "NLU Chatbot", icon: MessageSquare, description: "RASA-powered chatbot" },
    { id: "annotation" as TabType, label: "Annotation Tool", icon: FileText, description: "Label intents & entities" },
  ];

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !workspace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">{workspace.name}</h1>
              <p className="text-xs text-muted-foreground">{workspace.description || "No description"}</p>
            </div>
          </div>
          <button className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 border-r border-border bg-background transition-transform z-40 overflow-y-auto`}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className={`text-xs mt-0.5 ${activeTab === item.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === "dataset" && <DatasetManager workspaceId={params.id as string} />}
          {activeTab === "train" && <ModelTraining workspaceId={params.id as string} />}
          {activeTab === "predict" && <ModelPrediction workspaceId={params.id as string} />}
          {activeTab === "evaluation" && <ModelEvaluation workspaceId={params.id as string} />}
          {activeTab === "nlu-chatbot" && <NLUChatbot workspaceId={params.id as string} />}
          {activeTab === "annotation" && <AnnotationTool workspaceId={params.id as string} />}
          {activeTab === "metadata" && <ModelMetadata workspaceId={params.id as string} />}
        </main>
      </div>
    </div>
  );
}