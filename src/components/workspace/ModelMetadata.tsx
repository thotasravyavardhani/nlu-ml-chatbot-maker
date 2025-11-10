"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, Brain, Calendar, Clock, Database, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModelMetadataProps {
  workspaceId: string;
}

export default function ModelMetadata({ workspaceId }: ModelMetadataProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelData, setModelData] = useState<any>(null);
  const [retraining, setRetraining] = useState(false);

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

  const handleDownloadModel = async (format: "pickle" | "h5") => {
    if (!selectedModel) return;
    window.open(`/api/models/${selectedModel}/download?format=${format}`, "_blank");
  };

  const handleRetrain = async () => {
    if (!selectedModel) return;

    setRetraining(true);
    try {
      const response = await fetch(`/api/models/${selectedModel}/retrain`, {
        method: "POST",
      });

      if (response.ok) {
        fetchModelDetails();
      }
    } catch (error) {
      console.error("Failed to retrain model:", error);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Model Metadata</h2>
        <p className="text-muted-foreground">
          View model details, download trained models, and retrain with new data
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
          {/* Model Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{modelData.modelName}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{modelData.algorithmType.replace("_", " ")}</p>
                </div>
              </div>
              {modelData.isSelected && (
                <Badge className="bg-primary">Selected Model</Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Column</p>
                    <p className="font-medium">{modelData.targetColumn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Features</p>
                    <p className="font-medium">
                      {modelData.featureColumnsJson
                        ? JSON.parse(modelData.featureColumnsJson).length
                        : 0} columns
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trained At</p>
                    <p className="font-medium">
                      {new Date(modelData.trainedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Training Duration</p>
                    <p className="font-medium">{modelData.trainingDuration}s</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-2xl font-bold">{(modelData.accuracy * 100).toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">F1 Score</p>
                  <p className="text-2xl font-bold">{(modelData.f1Score * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature Columns */}
          {modelData.featureColumnsJson && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Columns</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {JSON.parse(modelData.featureColumnsJson).map((col: string, idx: number) => (
                  <div key={idx} className="p-2 bg-muted rounded text-sm font-medium">
                    {col}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleDownloadModel("pickle")}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as Pickle
              </Button>
              <Button
                onClick={() => handleDownloadModel("h5")}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as H5
              </Button>
              <Button
                onClick={handleRetrain}
                disabled={retraining}
                className="w-full"
              >
                {retraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retraining...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retrain Model
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">About Retraining:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Retrain the model with updated dataset to improve accuracy</li>
                <li>Previous model version will be saved</li>
                <li>Training may take several minutes depending on dataset size</li>
              </ul>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
