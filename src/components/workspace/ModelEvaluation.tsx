"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, Target, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface ModelEvaluationProps {
  workspaceId: string;
}

export default function ModelEvaluation({ workspaceId }: ModelEvaluationProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelData, setModelData] = useState<any>(null);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchModels();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedModel) {
      fetchModelDetails();
      fetchTrainingHistory();
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/models`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const fetchModelDetails = async () => {
    try {
      const response = await fetch(`/api/models/${selectedModel}`);
      if (response.ok) {
        const data = await response.json();
        setModelData(data);
      }
    } catch (error) {
      console.error("Failed to fetch model details:", error);
    }
  };

  const fetchTrainingHistory = async () => {
    try {
      const response = await fetch(`/api/models/${selectedModel}/history`);
      if (response.ok) {
        const data = await response.json();
        setTrainingHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch training history:", error);
    }
  };

  const confusionMatrixData = modelData?.confusionMatrixJson
    ? JSON.parse(modelData.confusionMatrixJson)
    : null;

  const metricColors = {
    accuracy: "#10b981",
    precision: "#3b82f6",
    recall: "#f59e0b",
    f1Score: "#8b5cf6",
  };

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
                  <p className="text-2xl font-bold">{(modelData.precisionScore * 100).toFixed(2)}%</p>
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
                  <p className="text-2xl font-bold">{(modelData.recallScore * 100).toFixed(2)}%</p>
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
                  <p className="text-2xl font-bold">{(modelData.f1Score * 100).toFixed(2)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Metrics Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Accuracy", value: modelData.accuracy * 100, color: metricColors.accuracy },
                { name: "Precision", value: modelData.precisionScore * 100, color: metricColors.precision },
                { name: "Recall", value: modelData.recallScore * 100, color: metricColors.recall },
                { name: "F1 Score", value: modelData.f1Score * 100, color: metricColors.f1Score },
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

          {/* Training History */}
          {trainingHistory.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Training History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epochNumber" label={{ value: "Epoch", position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracyValue" stroke="#10b981" name="Accuracy" strokeWidth={2} />
                  <Line type="monotone" dataKey="lossValue" stroke="#ef4444" name="Loss" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Confusion Matrix */}
          {confusionMatrixData && (
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
