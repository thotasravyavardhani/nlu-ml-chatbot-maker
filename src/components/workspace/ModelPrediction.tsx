"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, Upload, Brain, Target, FileJson, Server, AlertCircle } from "lucide-react";
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
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [lastBackend, setLastBackend] = useState<string>("");

  useEffect(() => {
    fetchModels();
    checkBackendStatus();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedModel) {
      fetchModelDetails();
    }
  }, [selectedModel]);

  useEffect(() => {
    if (modelData) {
      initializeSingleInput();
    }
  }, [modelData]);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("/api/backend-status");
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data);
      }
    } catch (error) {
      console.error("Failed to check backend status:", error);
    }
  };

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
      const response = await fetch("/api/ml-models/predict", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModel,
          data: [singleInput],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
        setLastBackend(data.backend || 'simulation');
        toast.success("Prediction completed successfully!");
        
        if (data.backend === 'python') {
          console.log('✅ Using Python ML Backend');
        } else {
          console.log('⚠️ Using Simulation Mode');
        }
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
      const response = await fetch("/api/ml-models/predict", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModel,
          data: parsedData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
        setLastBackend(data.backend || 'simulation');
        toast.success(`Successfully predicted ${data.predictions.length} samples!`);
        
        if (data.backend === 'python') {
          console.log('✅ Using Python ML Backend');
        } else {
          console.log('⚠️ Using Simulation Mode');
        }
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
    <div className="space-y-6 relative">
      {/* Hero Background Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b684e359-c557-4912-a860-690f2785ae8e/generated_images/abstract-prediction-and-testing-backgrou-e1bceec9-20251113171103.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 border-2 border-border">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Model Testing & Prediction
            </h2>
            <p className="text-muted-foreground text-lg">
              Test trained models with new data and get real-time predictions
            </p>
          </div>
        </div>
      </div>

      {/* Backend Status */}
      {backendStatus && (
        <Card className="p-5 border-2">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5" />
            <span className="font-bold">Python ML Backend Status</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${backendStatus.mlService.available ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="font-semibold">ML Service: {backendStatus.mlService.available ? 'Connected' : 'Simulation Mode'}</span>
          </div>
          {!backendStatus.mlService.available && (
            <div className="mt-3 p-3 bg-yellow-500/10 rounded-xl flex items-start gap-2 text-sm border-2 border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                Python ML backend not connected. Using simulation mode. See <code className="px-1.5 py-0.5 bg-background rounded font-mono text-xs">PYTHON_BACKEND_SETUP.md</code> to set up real Python ML service.
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Model Selection */}
      <Card className="p-6 border-2">
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
          <div className="mt-4 p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Algorithm</p>
                <p className="font-bold capitalize">{modelData.algorithmType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Target Column</p>
                <p className="font-bold">{modelData.targetColumn}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Accuracy</p>
                <p className="font-bold">{(modelData.accuracy * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Features</p>
                <p className="font-bold">{featureColumns.length} columns</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Input Mode Selection */}
      {selectedModel && (
        <Card className="p-6 border-2">
          <Label className="text-base font-semibold mb-4 block">Input Mode</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode("single")}
              className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                inputMode === "single"
                  ? "border-primary bg-gradient-to-r from-primary/10 to-green-500/10 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Target className="w-7 h-7 text-primary mb-3" />
              <p className="font-bold text-base mb-1">Single Prediction</p>
              <p className="text-sm text-muted-foreground">Enter values manually</p>
            </button>
            <button
              onClick={() => setInputMode("batch")}
              className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                inputMode === "batch"
                  ? "border-primary bg-gradient-to-r from-primary/10 to-green-500/10 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FileJson className="w-7 h-7 text-primary mb-3" />
              <p className="font-bold text-base mb-1">Batch Prediction</p>
              <p className="text-sm text-muted-foreground">Upload JSON data</p>
            </button>
          </div>
        </Card>
      )}

      {/* Single Input Form */}
      {selectedModel && inputMode === "single" && (
        <Card className="p-6 border-2">
          <h3 className="text-lg font-bold mb-4">Enter Feature Values</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {featureColumns.map((col: string) => (
              <div key={col}>
                <Label className="mb-2 font-semibold">{col}</Label>
                <Input
                  type="text"
                  value={singleInput[col] || ""}
                  onChange={(e) => setSingleInput({ ...singleInput, [col]: e.target.value })}
                  placeholder={`Enter ${col}`}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleSinglePredict}
            disabled={predicting}
            size="lg"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
        <Card className="p-6 border-2">
          <h3 className="text-lg font-bold mb-4">Batch Input (JSON Format)</h3>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 font-semibold">Paste JSON Array</Label>
              <Textarea
                rows={10}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={`[\n  ${JSON.stringify(featureColumns.reduce((acc: any, col: string) => ({ ...acc, [col]: "" }), {}), null, 2).split('\n').join('\n  ')},\n  ...\n]`}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div className="bg-muted/50 p-4 rounded-xl text-sm border-2 border-border">
              <p className="font-semibold mb-2">Expected Format:</p>
              <code className="text-xs font-mono">
                [{featureColumns.map((col: string) => `"${col}": "value"`).join(", ")}]
              </code>
            </div>
            <Button
              onClick={handleBatchPredict}
              disabled={predicting}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Prediction Results ({predictions.length})</h3>
              {lastBackend && (
                <Badge variant={lastBackend === 'python' ? 'default' : 'secondary'} className="font-semibold">
                  {lastBackend === 'python' ? 'Python ML' : 'Simulation'}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={exportPredictions}>
              <Upload className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-xl border-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16 font-bold">#</TableHead>
                  {featureColumns.map((col: string) => (
                    <TableHead key={col} className="font-bold">{col}</TableHead>
                  ))}
                  <TableHead className="font-bold">
                    Predicted {modelData?.targetColumn}
                  </TableHead>
                  <TableHead className="font-bold">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((pred, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold">{idx + 1}</TableCell>
                    {featureColumns.map((col: string) => (
                      <TableCell key={col}>{pred.input[col]}</TableCell>
                    ))}
                    <TableCell>
                      <Badge variant="default" className="font-bold">
                        {pred.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pred.confidence > 0.8 ? "default" : "secondary"} className="font-semibold">
                        {(pred.confidence * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4 p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Total Predictions</p>
                <p className="text-2xl font-bold">{predictions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">High Confidence</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => p.confidence > 0.8).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {models.length === 0 && (
        <Card className="p-12 text-center border-2">
          <Brain className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No models available</h3>
          <p className="text-muted-foreground text-lg">
            Train a model first to start making predictions
          </p>
        </Card>
      )}
    </div>
  );
}