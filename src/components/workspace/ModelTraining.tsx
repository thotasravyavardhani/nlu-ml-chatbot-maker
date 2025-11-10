"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, Play, CheckCircle2, XCircle, GitBranch, TrendingUp, Grid3X3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModelTrainingProps {
  workspaceId: string;
}

type ProblemType = "classification" | "regression" | "clustering";

const algorithmsByType = {
  classification: [
    { id: "random_forest", name: "Random Forest", description: "Ensemble learning with decision trees", category: "supervised" },
    { id: "xgboost", name: "XGBoost", description: "Gradient boosting framework", category: "supervised" },
    { id: "gradient_boosting", name: "Gradient Boosting", description: "Boosting ensemble method", category: "supervised" },
    { id: "svm", name: "Support Vector Machine", description: "Maximum margin classifier", category: "supervised" },
    { id: "logistic_regression", name: "Logistic Regression", description: "Linear classification model", category: "supervised" },
    { id: "decision_tree", name: "Decision Tree", description: "Tree-based classification", category: "supervised" },
    { id: "knn", name: "K-Nearest Neighbors", description: "Instance-based learning", category: "supervised" },
    { id: "naive_bayes", name: "Naive Bayes", description: "Probabilistic classifier", category: "supervised" },
  ],
  regression: [
    { id: "linear_regression", name: "Linear Regression", description: "Linear relationship modeling", category: "supervised" },
    { id: "ridge", name: "Ridge Regression", description: "L2 regularized linear model", category: "supervised" },
    { id: "lasso", name: "Lasso Regression", description: "L1 regularized linear model", category: "supervised" },
    { id: "random_forest_regressor", name: "Random Forest Regressor", description: "Ensemble for regression", category: "supervised" },
    { id: "xgboost_regressor", name: "XGBoost Regressor", description: "Gradient boosting for regression", category: "supervised" },
    { id: "svr", name: "Support Vector Regression", description: "SVM for regression tasks", category: "supervised" },
    { id: "decision_tree_regressor", name: "Decision Tree Regressor", description: "Tree-based regression", category: "supervised" },
    { id: "gradient_boosting_regressor", name: "Gradient Boosting Regressor", description: "Boosting for regression", category: "supervised" },
  ],
  clustering: [
    { id: "kmeans", name: "K-Means", description: "Centroid-based clustering", category: "unsupervised" },
    { id: "dbscan", name: "DBSCAN", description: "Density-based clustering", category: "unsupervised" },
    { id: "hierarchical", name: "Hierarchical Clustering", description: "Tree-based clustering", category: "unsupervised" },
    { id: "gmm", name: "Gaussian Mixture Models", description: "Probabilistic clustering", category: "unsupervised" },
    { id: "mean_shift", name: "Mean Shift", description: "Centroid-based clustering", category: "unsupervised" },
    { id: "spectral", name: "Spectral Clustering", description: "Graph-based clustering", category: "unsupervised" },
  ],
};

export default function ModelTraining({ workspaceId }: ModelTrainingProps) {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [problemType, setProblemType] = useState<ProblemType>("classification");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(["random_forest", "xgboost"]);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingResults, setTrainingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, [workspaceId]);

  useEffect(() => {
    // Update default selected algorithms when problem type changes
    if (problemType === "classification") {
      setSelectedAlgorithms(["random_forest", "xgboost", "svm"]);
    } else if (problemType === "regression") {
      setSelectedAlgorithms(["linear_regression", "random_forest_regressor", "xgboost_regressor"]);
    } else if (problemType === "clustering") {
      setSelectedAlgorithms(["kmeans", "dbscan"]);
      setTargetColumn(""); // Clustering doesn't need target column
    }
  }, [problemType]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/datasets?workspaceId=${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
      toast.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetChange = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets.find(d => d.id.toString() === datasetId);
    if (dataset && dataset.columnsJson) {
      const cols = Array.isArray(dataset.columnsJson) ? dataset.columnsJson : JSON.parse(dataset.columnsJson);
      setColumns(cols);
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
    if (!selectedDataset || selectedAlgorithms.length === 0) {
      toast.error("Please select a dataset and at least one algorithm");
      return;
    }

    if (problemType !== "clustering" && !targetColumn) {
      toast.error("Please select a target column");
      return;
    }

    setTraining(true);
    setTrainingProgress(0);
    setTrainingResults([]);

    // Simulate training progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/ml-models/train", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId,
          datasetId: selectedDataset,
          problemType,
          targetColumn: problemType !== "clustering" ? targetColumn : undefined,
          algorithms: selectedAlgorithms,
        }),
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setTrainingResults(data.results || []);
        setTrainingProgress(100);
        toast.success(`Successfully trained ${selectedAlgorithms.length} models!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Training failed");
      }
    } catch (error) {
      console.error("Training failed:", error);
      toast.error("Training failed. Please try again.");
      clearInterval(progressInterval);
    } finally {
      setTraining(false);
    }
  };

  const currentAlgorithms = algorithmsByType[problemType];

  const getProblemTypeIcon = (type: ProblemType) => {
    switch (type) {
      case "classification":
        return <GitBranch className="w-4 h-4" />;
      case "regression":
        return <TrendingUp className="w-4 h-4" />;
      case "clustering":
        return <Grid3X3 className="w-4 h-4" />;
    }
  };

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
        <h2 className="text-2xl font-bold mb-2">Model Training</h2>
        <p className="text-muted-foreground">
          Train multiple ML algorithms for supervised and unsupervised learning
        </p>
      </div>

      {/* Problem Type Selection */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-3 block">Select Problem Type</Label>
        <Tabs value={problemType} onValueChange={(v) => setProblemType(v as ProblemType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classification" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Classification
            </TabsTrigger>
            <TabsTrigger value="regression" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Regression
            </TabsTrigger>
            <TabsTrigger value="clustering" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Clustering
            </TabsTrigger>
          </TabsList>
          <TabsContent value="classification" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Supervised Classification</p>
              <p className="text-muted-foreground">Predict categorical labels from labeled training data</p>
            </div>
          </TabsContent>
          <TabsContent value="regression" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Supervised Regression</p>
              <p className="text-muted-foreground">Predict continuous values from labeled training data</p>
            </div>
          </TabsContent>
          <TabsContent value="clustering" className="mt-4">
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Unsupervised Clustering</p>
              <p className="text-muted-foreground">Group similar data points without labeled data</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

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
                    {dataset.name} ({dataset.rowCount} rows, {dataset.fileFormat?.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {problemType !== "clustering" && columns.length > 0 && (
            <div>
              <Label>Target Column {problemType === "classification" ? "(Label)" : "(Value)"}</Label>
              <Select value={targetColumn} onValueChange={setTargetColumn}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={`Select ${problemType === "classification" ? "label" : "target"} column`} />
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
        <h3 className="text-lg font-semibold mb-4">
          Select {problemType === "clustering" ? "Clustering" : "Supervised"} Algorithms ({selectedAlgorithms.length} selected)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {currentAlgorithms.map((algo) => (
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
          disabled={training || !selectedDataset || (problemType !== "clustering" && !targetColumn) || selectedAlgorithms.length === 0}
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
              Train {selectedAlgorithms.length} {problemType === "clustering" ? "Clustering" : "Supervised"} Models
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
                    <p className="text-muted-foreground">
                      {problemType === "clustering" ? "Silhouette" : "Accuracy"}
                    </p>
                    <p className="font-bold text-lg">{(result.accuracy * 100).toFixed(2)}%</p>
                  </div>
                  {problemType !== "clustering" && (
                    <>
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
                    </>
                  )}
                  {problemType === "clustering" && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Clusters</p>
                        <p className="font-bold text-lg">{result.nClusters || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inertia</p>
                        <p className="font-bold text-lg">{result.inertia?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {datasets.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No datasets available</h3>
          <p className="text-muted-foreground">
            Upload a dataset first to start training ML models
          </p>
        </Card>
      )}
    </div>
  );
}