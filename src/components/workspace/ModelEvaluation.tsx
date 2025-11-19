"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, Target, Zap, Loader2, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

interface ModelEvaluationProps {
  workspaceId: string;
}

export default function ModelEvaluation({ workspaceId }: ModelEvaluationProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelData, setModelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedModel) {
      fetchModelDetails();
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ml-models?workspaceId=${workspaceId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const fetchModelDetails = async () => {
    try {
      const response = await fetch(`/api/ml-models/${selectedModel}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setModelData(data);
      }
    } catch (error) {
      console.error("Failed to fetch model details:", error);
    }
  };

  const getConfusionMatrix = () => {
    if (!modelData?.confusionMatrixJson) return null;
    
    try {
      if (Array.isArray(modelData.confusionMatrixJson)) {
        return modelData.confusionMatrixJson;
      }
      
      if (typeof modelData.confusionMatrixJson === 'object' && modelData.confusionMatrixJson !== null) {
        return modelData.confusionMatrixJson;
      }
      
      if (typeof modelData.confusionMatrixJson === 'string') {
        const cleaned = modelData.confusionMatrixJson.trim();
        if (cleaned.length === 0) return null;
        
        const parsed = JSON.parse(cleaned);
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to parse confusion matrix:", error, modelData.confusionMatrixJson);
      return [
        [0, 0],
        [0, 0]
      ];
    }
  };

  const confusionMatrixData = getConfusionMatrix();

  const metricColors = {
    accuracy: "#10b981",
    precision: "#3b82f6",
    recall: "#f59e0b",
    f1Score: "#8b5cf6",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <Card className="p-12 text-center border-2">
        <BarChart3 className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">No models available</h3>
        <p className="text-muted-foreground text-lg">
          Train a model first to view evaluation metrics
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Hero Background Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b684e359-c557-4912-a860-690f2785ae8e/generated_images/abstract-ai-analytics-dashboard-backgrou-7f749cd8-20251113171102.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-8 border-2 border-border">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Model Evaluation
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive metrics, charts, and confusion matrices for trained models
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <Card className="p-6 border-2">
        <div>
          <label className="text-base font-semibold mb-3 block">Select Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.modelName} - {model.algorithmType}
                  {model.isSelected && " ⭐"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {modelData && (
        <>
          {/* Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 border-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border-2 border-green-500/30">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Accuracy</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(modelData.accuracy * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border-2 border-blue-500/30">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Precision</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{((modelData.precisionScore || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border-2 border-orange-500/30">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Recall</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{((modelData.recallScore || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border-2 border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">F1 Score</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{((modelData.f1Score || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Metrics Bar Chart */}
          <Card className="p-6 border-2">
            <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Accuracy", value: (modelData.accuracy || 0) * 100, color: metricColors.accuracy },
                { name: "Precision", value: (modelData.precisionScore || 0) * 100, color: metricColors.precision },
                { name: "Recall", value: (modelData.recallScore || 0) * 100, color: metricColors.recall },
                { name: "F1 Score", value: (modelData.f1Score || 0) * 100, color: metricColors.f1Score },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {[metricColors.accuracy, metricColors.precision, metricColors.recall, metricColors.f1Score].map((color, idx) => (
                    <Cell key={idx} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Confusion Matrix */}
          {confusionMatrixData && Array.isArray(confusionMatrixData) && confusionMatrixData.length > 0 && (
            <Card className="p-6 border-2">
              <h3 className="text-lg font-bold mb-4">Confusion Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-border p-3 bg-muted font-bold"></th>
                      {confusionMatrixData[0].map((_: any, idx: number) => (
                        <th key={idx} className="border-2 border-border p-3 bg-muted font-bold">
                          Predicted {idx}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {confusionMatrixData.map((row: number[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        <td className="border-2 border-border p-3 bg-muted font-bold">Actual {rowIdx}</td>
                        {row.map((cell: number, cellIdx: number) => (
                          <td
                            key={cellIdx}
                            className={`border-2 border-border p-4 text-center font-bold text-lg ${
                              rowIdx === cellIdx ? "bg-green-500/20 text-green-700 dark:text-green-300" : "bg-red-500/10 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}