"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, Play, CheckCircle2, XCircle, GitBranch, TrendingUp, Grid3X3, Server, AlertCircle, XOctagon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    { id: "random_forest", name: "Random Forest Regressor", description: "Ensemble for regression", category: "supervised" },
    { id: "xgboost", name: "XGBoost Regressor", description: "Gradient boosting for regression", category: "supervised" },
    { id: "svr", name: "Support Vector Regression", description: "SVM for regression tasks", category: "supervised" },
    { id: "decision_tree", name: "Decision Tree Regressor", description: "Tree-based regression", category: "supervised" },
    { id: "gradient_boosting", name: "Gradient Boosting Regressor", description: "Boosting for regression", category: "supervised" },
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
  const [backendStatus, setBackendStatus] = useState<any>(null);

  useEffect(() => {
    fetchDatasets();
    checkBackendStatus();
    
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  useEffect(() => {
    if (problemType === "classification") {
      setSelectedAlgorithms(["random_forest", "xgboost", "svm"]);
    } else if (problemType === "regression") {
      setSelectedAlgorithms(["linear_regression", "random_forest", "xgboost"]);
    } else if (problemType === "clustering") {
      setSelectedAlgorithms(["kmeans", "dbscan"]);
      setTargetColumn("");
    }
  }, [problemType]);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("/api/backend-status");
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data);
      }
    } catch (error) {
      console.error("Failed to check backend status:", error);
      setBackendStatus(null);
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/datasets?workspaceId=${workspaceId}`, {
        credentials: "include",
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
    if (!backendStatus?.mlService.available) {
      toast.error("Python ML backend is not connected", {
        description: "Please start the Python backend service to train models",
      });
      return;
    }

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
      const datasetResponse = await fetch(`/api/datasets/${selectedDataset}`, {
        credentials: "include",
      });
      
      if (!datasetResponse.ok) {
        throw new Error("Failed to load dataset");
      }

      const dataset = await datasetResponse.json();
      const datasetContent = dataset.fileContent || "";
      const datasetFormat = dataset.fileFormat || "csv";

      if (!datasetContent || datasetContent.trim().length === 0) {
        clearInterval(progressInterval);
        setTraining(false);
        toast.error("Dataset content is empty", {
          description: "This dataset doesn't have content stored. Please re-upload the dataset to fix this issue.",
          duration: 6000,
        });
        return;
      }

      console.log(`[TRAINING] Dataset loaded: ${dataset.name}, Format: ${datasetFormat}, Size: ${datasetContent.length} chars`);

      const pythonResponse = await fetch("/api/python/ml/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          dataset_id: selectedDataset,
          dataset_content: datasetContent,
          dataset_format: datasetFormat,
          target_column: problemType !== "clustering" ? targetColumn : null,
          problem_type: problemType,
          algorithms: selectedAlgorithms,
          test_size: 0.2,
          n_clusters: 3,
        }),
      });

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(errorData.error || errorData.detail || "Python backend training failed");
      }

      const pythonData = await pythonResponse.json();
      const pythonResults = pythonData.results || [];

      const successfulResults = pythonResults.filter((r: any) => !r.error);
      if (successfulResults.length === 0) {
        clearInterval(progressInterval);
        setTraining(false);
        toast.error("All algorithms failed to train", {
          description: pythonResults[0]?.error || "Check the dataset format and try again",
          duration: 6000,
        });
        return;
      }

      clearInterval(progressInterval);

      const dbResponse = await fetch("/api/ml-models/train", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          datasetId: selectedDataset,
          problemType,
          targetColumn: problemType !== "clustering" ? targetColumn : undefined,
          algorithms: selectedAlgorithms,
          pythonResults: pythonResults,
        }),
      });

      if (dbResponse.ok) {
        const data = await dbResponse.json();
        setTrainingResults(data.results || []);
        setTrainingProgress(100);
        
        const failedCount = pythonResults.filter((r: any) => r.error).length;
        if (failedCount > 0) {
          toast.success(`Trained ${successfulResults.length} models successfully`, {
            description: `${failedCount} algorithm(s) failed. Check the results below.`,
          });
        } else {
          toast.success(`Successfully trained ${selectedAlgorithms.length} models using Python ML!`, {
            description: "Models saved and ready for prediction",
          });
        }
      } else {
        const error = await dbResponse.json();
        throw new Error(error.error || "Failed to save training results");
      }
    } catch (error) {
      console.error("Training failed:", error);
      toast.error("Training failed", {
        description: (error as Error).message || "Please ensure Python backend is running",
      });
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

  const isPythonBackendConnected = backendStatus?.mlService.available;

  return (
    <div className="space-y-6 relative">
      {/* Hero Background Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b684e359-c557-4912-a860-690f2785ae8e/generated_images/abstract-machine-learning-training-backg-12e8bdc3-20251113171102.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 border-2 border-border">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Model Training
            </h2>
            <p className="text-muted-foreground text-lg">
              Train multiple ML algorithms for supervised and unsupervised learning
            </p>
          </div>
        </div>
      </div>

      {/* Backend Status */}
      <Card className={`p-5 border-2 ${!isPythonBackendConnected ? 'border-destructive' : 'border-green-500'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-5 h-5" />
          <span className="font-bold">Python ML Backend Status</span>
        </div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPythonBackendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-semibold">ML Service: {isPythonBackendConnected ? 'Connected' : 'Disconnected'}</span>
          {isPythonBackendConnected && (
            <Badge variant="default" className="ml-2">Active</Badge>
          )}
          {!isPythonBackendConnected && (
            <Badge variant="destructive" className="ml-2">Required</Badge>
          )}
        </div>
        {!isPythonBackendConnected && (
          <Alert variant="destructive" className="mt-3">
            <XOctagon className="h-4 w-4" />
            <AlertTitle className="font-bold">Python ML Backend Required</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              <p className="mb-2">The Python ML backend must be running to train models. Training is not available without it.</p>
              <code className="block px-3 py-2 bg-background/50 rounded text-xs font-mono">
                cd python-backend && ./start.sh
              </code>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Problem Type Selection */}
      <Card className="p-6 border-2">
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
            <div className="bg-muted/50 p-4 rounded-xl text-sm border-2 border-border">
              <p className="font-semibold mb-1">Supervised Classification</p>
              <p className="text-muted-foreground">Predict categorical labels from labeled training data</p>
            </div>
          </TabsContent>
          <TabsContent value="regression" className="mt-4">
            <div className="bg-muted/50 p-4 rounded-xl text-sm border-2 border-border">
              <p className="font-semibold mb-1">Supervised Regression</p>
              <p className="text-muted-foreground">Predict continuous values from labeled training data</p>
            </div>
          </TabsContent>
          <TabsContent value="clustering" className="mt-4">
            <div className="bg-muted/50 p-4 rounded-xl text-sm border-2 border-border">
              <p className="font-semibold mb-1">Unsupervised Clustering</p>
              <p className="text-muted-foreground">Group similar data points without labeled data</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Configuration */}
      <Card className="p-6 border-2">
        <h3 className="text-lg font-bold mb-4">Training Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Select Dataset</Label>
            <Select value={selectedDataset} onValueChange={handleDatasetChange}>
              <SelectTrigger className="mt-2">
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
              <Label className="text-base font-semibold">Target Column {problemType === "classification" ? "(Label)" : "(Value)"}</Label>
              <Select value={targetColumn} onValueChange={setTargetColumn}>
                <SelectTrigger className="mt-2">
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
      <Card className="p-6 border-2">
        <h3 className="text-lg font-bold mb-4">
          Select {problemType === "clustering" ? "Clustering" : "Supervised"} Algorithms ({selectedAlgorithms.length} selected)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {currentAlgorithms.map((algo) => (
            <div
              key={algo.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedAlgorithms.includes(algo.id)
                  ? "border-primary bg-gradient-to-r from-primary/10 to-purple-500/10 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleAlgorithm(algo.id)}
            >
              <Checkbox
                checked={selectedAlgorithms.includes(algo.id)}
                onCheckedChange={() => toggleAlgorithm(algo.id)}
              />
              <div className="flex-1">
                <p className="font-bold">{algo.name}</p>
                <p className="text-sm text-muted-foreground">{algo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Training Button */}
      <Card className="p-6 border-2">
        <Button
          onClick={handleTrain}
          disabled={training || !selectedDataset || (problemType !== "clustering" && !targetColumn) || selectedAlgorithms.length === 0 || !isPythonBackendConnected}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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

        {!isPythonBackendConnected && (
          <p className="text-sm text-destructive text-center mt-3 font-semibold">
            Python ML backend must be connected to train models
          </p>
        )}

        {training && (
          <div className="mt-4">
            <Progress value={trainingProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center mt-2 font-semibold">
              Training in progress... {trainingProgress}%
            </p>
          </div>
        )}
      </Card>

      {/* Training Results */}
      {trainingResults.length > 0 && (
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Training Results</h3>
            <Badge variant="default" className="font-semibold">Python ML Backend</Badge>
          </div>
          <div className="space-y-3">
            {trainingResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 ${
                  result.selected ? "border-primary bg-gradient-to-r from-primary/10 to-purple-500/10 shadow-md" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-bold text-base">{result.algorithmName}</span>
                    {result.selected && (
                      <Badge className="bg-primary font-semibold">
                        Best Model
                      </Badge>
                    )}
                  </div>
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-1">
                      {problemType === "clustering" ? "Silhouette" : "Accuracy"}
                    </p>
                    <p className="font-bold text-lg">{(result.accuracy * 100).toFixed(2)}%</p>
                  </div>
                  {problemType !== "clustering" && (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Precision</p>
                        <p className="font-bold text-lg">{(result.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Recall</p>
                        <p className="font-bold text-lg">{(result.recall * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">F1 Score</p>
                        <p className="font-bold text-lg">{(result.f1Score * 100).toFixed(2)}%</p>
                      </div>
                    </>
                  )}
                  {problemType === "clustering" && (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Clusters</p>
                        <p className="font-bold text-lg">{result.nClusters || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Inertia</p>
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
        <Card className="p-12 text-center border-2">
          <Brain className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No datasets available</h3>
          <p className="text-muted-foreground text-lg">
            Upload a dataset first to start training ML models
          </p>
        </Card>
      )}
    </div>
  );
}