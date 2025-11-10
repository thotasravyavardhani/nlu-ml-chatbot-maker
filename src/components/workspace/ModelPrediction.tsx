"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, CheckCircle2, XCircle, Upload, Brain, TrendingUp, Target, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModelPredictionProps {
  workspaceId: string;
}

export default function ModelPrediction({ workspaceId }: ModelPredictionProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelData, setModelData] = useState<any>(null);
  const [inputMode, setInputMode] = useState<"single" | "batch">("single");
  const [singleInput, setSingleInput] = useState<Record<string, string>>({});
  const [batchInput, setBatchInput] = useState<string>("");
  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedModel) {
      fetchModelDetails();
      initializeSingleInput();
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

  const initializeSingleInput = () => {
    if (modelData?.featureColumnsJson) {
      const features = Array.isArray(modelData.featureColumnsJson) 
        ? modelData.featureColumnsJson 
        : JSON.parse(modelData.featureColumnsJson);
      
      const initialInput: Record<string, string> = {};
      features.forEach((col: string) => {
        if (col !== modelData.targetColumn) {
          initialInput[col] = "";
        }
      });
      setSingleInput(initialInput);
    }
  };

  const handleSinglePredict = async () => {
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    const features = Object.keys(singleInput);
    const emptyFields = features.filter(key => !singleInput[key].trim());
    if (emptyFields.length > 0) {
      toast.error("Please fill in all feature values");
      return;
    }

    setPredicting(true);
    setPredictions([]);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/ml-models/predict", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modelId: selectedModel,
          data: [singleInput],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
        toast.success("Prediction completed successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      toast.error("Prediction failed. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  const handleBatchPredict = async () => {
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    if (!batchInput.trim()) {
      toast.error("Please provide batch input data");
      return;
    }

    let parsedData: any[];
    try {
      parsedData = JSON.parse(batchInput);
      if (!Array.isArray(parsedData)) {
        throw new Error("Data must be an array");
      }
    } catch (error) {
      toast.error("Invalid JSON format. Expected an array of objects.");
      return;
    }

    setPredicting(true);
    setPredictions([]);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/ml-models/predict", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modelId: selectedModel,
          data: parsedData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
        toast.success(`Successfully predicted ${data.predictions.length} samples!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      toast.error("Prediction failed. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  const exportPredictions = () => {
    const dataStr = JSON.stringify(predictions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `predictions_${new Date().getTime()}.json`;
    link.click();
    toast.success("Predictions exported successfully!");
  };

  const featureColumns = modelData?.featureColumnsJson 
    ? (Array.isArray(modelData.featureColumnsJson) 
        ? modelData.featureColumnsJson 
        : JSON.parse(modelData.featureColumnsJson)).filter((col: string) => col !== modelData.targetColumn)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Model Testing & Prediction</h2>
        <p className="text-muted-foreground">
          Test trained models with new data and get real-time predictions
        </p>
      </div>

      {/* Model Selection */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-3 block">Select Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a trained model" />
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

        {modelData && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Algorithm</p>
                <p className="font-semibold capitalize">{modelData.algorithmType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Target Column</p>
                <p className="font-semibold">{modelData.targetColumn}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Accuracy</p>
                <p className="font-semibold">{(modelData.accuracy * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Features</p>
                <p className="font-semibold">{featureColumns.length} columns</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Input Mode Selection */}
      {selectedModel && (
        <Card className="p-6">
          <Label className="text-base font-semibold mb-3 block">Input Mode</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode("single")}
              className={`p-4 rounded-lg border-2 transition text-left ${
                inputMode === "single"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Target className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold">Single Prediction</p>
              <p className="text-sm text-muted-foreground">Enter values manually</p>
            </button>
            <button
              onClick={() => setInputMode("batch")}
              className={`p-4 rounded-lg border-2 transition text-left ${
                inputMode === "batch"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FileJson className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold">Batch Prediction</p>
              <p className="text-sm text-muted-foreground">Upload JSON data</p>
            </button>
          </div>
        </Card>
      )}

      {/* Single Input Form */}
      {selectedModel && inputMode === "single" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Enter Feature Values</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {featureColumns.map((col: string) => (
              <div key={col}>
                <Label className="mb-2">{col}</Label>
                <Input
                  type="text"
                  value={singleInput[col] || ""}
                  onChange={(e) => setSingleInput({ ...singleInput, [col]: e.target.value })}
                  placeholder={`Enter ${col}`}
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleSinglePredict}
            disabled={predicting}
            size="lg"
            className="w-full"
          >
            {predicting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Get Prediction
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Batch Input Form */}
      {selectedModel && inputMode === "batch" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Input (JSON Format)</h3>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Paste JSON Array</Label>
              <Textarea
                rows={10}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={`[\n  ${JSON.stringify(featureColumns.reduce((acc: any, col: string) => ({ ...acc, [col]: "" }), {}), null, 2).split('\n').join('\n  ')},\n  ...\n]`}
                className="font-mono text-sm"
              />
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Expected Format:</p>
              <code className="text-xs">
                [{featureColumns.map((col: string) => `"${col}": "value"`).join(", ")}]
              </code>
            </div>
            <Button
              onClick={handleBatchPredict}
              disabled={predicting}
              size="lg"
              className="w-full"
            >
              {predicting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Predict Batch
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Prediction Results */}
      {predictions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Prediction Results ({predictions.length})</h3>
            <Button variant="outline" size="sm" onClick={exportPredictions}>
              <Upload className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  {featureColumns.map((col: string) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="font-semibold">
                    Predicted {modelData?.targetColumn}
                  </TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((pred, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    {featureColumns.map((col: string) => (
                      <TableCell key={col}>{pred.input[col]}</TableCell>
                    ))}
                    <TableCell>
                      <Badge variant="default" className="font-semibold">
                        {pred.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pred.confidence > 0.8 ? "default" : "secondary"}>
                        {(pred.confidence * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Total Predictions</p>
                <p className="text-xl font-bold">{predictions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Avg Confidence</p>
                <p className="text-xl font-bold">
                  {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">High Confidence</p>
                <p className="text-xl font-bold">
                  {predictions.filter(p => p.confidence > 0.8).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {models.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No models available</h3>
          <p className="text-muted-foreground">
            Train a model first to start making predictions
          </p>
        </Card>
      )}
    </div>
  );
}
