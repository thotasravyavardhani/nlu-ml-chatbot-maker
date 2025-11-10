"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, Play, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ModelTrainingProps {
  workspaceId: string;
}

const algorithms = [
  { id: "random_forest", name: "Random Forest", description: "Ensemble learning method" },
  { id: "xgboost", name: "XGBoost", description: "Gradient boosting algorithm" },
  { id: "svm", name: "Support Vector Machine", description: "Classification algorithm" },
  { id: "logistic_regression", name: "Logistic Regression", description: "Statistical model" },
  { id: "decision_tree", name: "Decision Tree", description: "Tree-based model" },
  { id: "knn", name: "K-Nearest Neighbors", description: "Instance-based learning" },
];

export default function ModelTraining({ workspaceId }: ModelTrainingProps) {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(["random_forest", "xgboost"]);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingResults, setTrainingResults] = useState<any[]>([]);

  useEffect(() => {
    fetchDatasets();
  }, [workspaceId]);

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/datasets`);
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  };

  const handleDatasetChange = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets.find(d => d.id.toString() === datasetId);
    if (dataset && dataset.columnsJson) {
      setColumns(JSON.parse(dataset.columnsJson));
    }
  };

  const toggleAlgorithm = (algorithmId: string) => {
    setSelectedAlgorithms(prev =>
      prev.includes(algorithmId)
        ? prev.filter(id => id !== algorithmId)
        : [...prev, algorithmId]
    );
  };

  const handleTrain = async () => {
    if (!selectedDataset || !targetColumn || selectedAlgorithms.length === 0) {
      return;
    }

    setTraining(true);
    setTrainingProgress(0);
    setTrainingResults([]);

    try {
      const response = await fetch("/api/models/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          datasetId: selectedDataset,
          targetColumn,
          algorithms: selectedAlgorithms,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTrainingResults(data.results);
        setTrainingProgress(100);
      }
    } catch (error) {
      console.error("Training failed:", error);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Model Training</h2>
        <p className="text-muted-foreground">
          Train multiple ML algorithms simultaneously and auto-select the best performing model
        </p>
      </div>

      {/* Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Training Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label>Select Dataset</Label>
            <Select value={selectedDataset} onValueChange={handleDatasetChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id.toString()}>
                    {dataset.name} ({dataset.rowCount} rows)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {columns.length > 0 && (
            <div>
              <Label>Target Column</Label>
              <Select value={targetColumn} onValueChange={setTargetColumn}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target column for prediction" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Algorithm Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Algorithms ({selectedAlgorithms.length} selected)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                selectedAlgorithms.includes(algo.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleAlgorithm(algo.id)}
            >
              <Checkbox
                checked={selectedAlgorithms.includes(algo.id)}
                onCheckedChange={() => toggleAlgorithm(algo.id)}
              />
              <div className="flex-1">
                <p className="font-semibold">{algo.name}</p>
                <p className="text-sm text-muted-foreground">{algo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Training Button */}
      <Card className="p-6">
        <Button
          onClick={handleTrain}
          disabled={training || !selectedDataset || !targetColumn || selectedAlgorithms.length === 0}
          size="lg"
          className="w-full"
        >
          {training ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Training {selectedAlgorithms.length} Models...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Train {selectedAlgorithms.length} Models
            </>
          )}
        </Button>

        {training && (
          <div className="mt-4">
            <Progress value={trainingProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Training in progress... {trainingProgress}%
            </p>
          </div>
        )}
      </Card>

      {/* Training Results */}
      {trainingResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Training Results</h3>
          <div className="space-y-3">
            {trainingResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  result.selected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{result.algorithmName}</span>
                    {result.selected && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        Best Model
                      </span>
                    )}
                  </div>
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-bold text-lg">{(result.accuracy * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Precision</p>
                    <p className="font-bold text-lg">{(result.precision * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recall</p>
                    <p className="font-bold text-lg">{(result.recall * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">F1 Score</p>
                    <p className="font-bold text-lg">{(result.f1Score * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
