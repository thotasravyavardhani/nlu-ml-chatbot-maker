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
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/ml-models?workspaceId=${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/ml-models/${selectedModel}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModelData(data);
      }
    } catch (error) {
      console.error("Failed to fetch model details:", error);
    }
  };

  // Safe JSON parsing with multiple fallback strategies
  const getConfusionMatrix = () => {
    if (!modelData?.confusionMatrixJson) return null;
    
    try {
      // Strategy 1: Already parsed object/array
      if (Array.isArray(modelData.confusionMatrixJson)) {
        return modelData.confusionMatrixJson;
      }
      
      // Strategy 2: It's an object (not array but still valid)
      if (typeof modelData.confusionMatrixJson === 'object' && modelData.confusionMatrixJson !== null) {
        return modelData.confusionMatrixJson;
      }
      
      // Strategy 3: It's a string that needs parsing
      if (typeof modelData.confusionMatrixJson === 'string') {
        // Remove any potential BOM or whitespace
        const cleaned = modelData.confusionMatrixJson.trim();
        if (cleaned.length === 0) return null;
        
        // Try to parse
        const parsed = JSON.parse(cleaned);
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to parse confusion matrix:", error, modelData.confusionMatrixJson);
      // Return a default matrix for display purposes
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
      <Card className="p-12 text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No models available</h3>
        <p className="text-muted-foreground">
          Train a model first to view evaluation metrics
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Model Evaluation</h2>
        <p className="text-muted-foreground">
          Comprehensive metrics, charts, and confusion matrices for trained models
        </p>
      </div>

      {/* Model Selection */}
      <Card className="p-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Model</label>
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
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{(modelData.accuracy * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precision</p>
                  <p className="text-2xl font-bold">{((modelData.precisionScore || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recall</p>
                  <p className="text-2xl font-bold">{((modelData.recallScore || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">F1 Score</p>
                  <p className="text-2xl font-bold">{((modelData.f1Score || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Metrics Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 bg-muted"></th>
                      {confusionMatrixData[0].map((_: any, idx: number) => (
                        <th key={idx} className="border border-border p-2 bg-muted font-semibold">
                          Predicted {idx}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {confusionMatrixData.map((row: number[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        <td className="border border-border p-2 bg-muted font-semibold">Actual {rowIdx}</td>
                        {row.map((cell: number, cellIdx: number) => (
                          <td
                            key={cellIdx}
                            className={`border border-border p-4 text-center font-semibold ${
                              rowIdx === cellIdx ? "bg-green-500/20" : "bg-red-500/10"
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