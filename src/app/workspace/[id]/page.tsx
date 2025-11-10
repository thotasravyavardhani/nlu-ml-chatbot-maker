"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Database, Zap, BarChart3, MessageSquare, Settings as SettingsIcon, FileText, Download, RefreshCw, ArrowLeft, Menu, X } from "lucide-react";
import DatasetManager from "@/components/workspace/DatasetManager";
import ModelTraining from "@/components/workspace/ModelTraining";
import ModelEvaluation from "@/components/workspace/ModelEvaluation";
import NLUChatbot from "@/components/workspace/NLUChatbot";
import AnnotationTool from "@/components/workspace/AnnotationTool";
import ModelMetadata from "@/components/workspace/ModelMetadata";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
}

type TabType = "dataset" | "train" | "evaluation" | "nlu-chatbot" | "annotation" | "metadata";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dataset");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchWorkspace();
  }, [params.id]);

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
    }
  };

  const menuItems = [
    { id: "dataset" as TabType, label: "Dataset Upload", icon: Database },
    { id: "train" as TabType, label: "Train Models", icon: Zap },
    { id: "evaluation" as TabType, label: "Model Evaluation", icon: BarChart3 },
    { id: "nlu-chatbot" as TabType, label: "NLU Chatbot", icon: MessageSquare },
    { id: "annotation" as TabType, label: "Annotation Tool", icon: FileText },
    { id: "metadata" as TabType, label: "Model Metadata", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">{workspace?.name || "Loading..."}</h1>
              <p className="text-xs text-muted-foreground">{workspace?.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background transition-transform z-40`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === "dataset" && <DatasetManager workspaceId={params.id as string} />}
          {activeTab === "train" && <ModelTraining workspaceId={params.id as string} />}
          {activeTab === "evaluation" && <ModelEvaluation workspaceId={params.id as string} />}
          {activeTab === "nlu-chatbot" && <NLUChatbot workspaceId={params.id as string} />}
          {activeTab === "annotation" && <AnnotationTool workspaceId={params.id as string} />}
          {activeTab === "metadata" && <ModelMetadata workspaceId={params.id as string} />}
        </main>
      </div>
    </div>
  );
}
