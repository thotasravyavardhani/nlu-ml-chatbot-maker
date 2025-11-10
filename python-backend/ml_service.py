"""
ML Service - Handles all machine learning operations
Supports Classification, Regression, and Clustering
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
import json
import yaml
import io
import os
from datetime import datetime

# ML Algorithms
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, MeanShift, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    mean_squared_error, r2_score, mean_absolute_error,
    silhouette_score
)
from xgboost import XGBClassifier, XGBRegressor

app = FastAPI(title="ML Service", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models Directory
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# Algorithm Mappings
CLASSIFICATION_ALGORITHMS = {
    "random_forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "xgboost": XGBClassifier(n_estimators=100, random_state=42, use_label_encoder=False, eval_metric='logloss'),
    "gradient_boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
    "svm": SVC(kernel='rbf', random_state=42),
    "logistic_regression": LogisticRegression(random_state=42, max_iter=1000),
    "decision_tree": DecisionTreeClassifier(random_state=42),
    "knn": KNeighborsClassifier(n_neighbors=5),
    "naive_bayes": GaussianNB()
}

REGRESSION_ALGORITHMS = {
    "linear_regression": LinearRegression(),
    "ridge": Ridge(alpha=1.0, random_state=42),
    "lasso": Lasso(alpha=1.0, random_state=42),
    "random_forest": RandomForestRegressor(n_estimators=100, random_state=42),
    "xgboost": XGBRegressor(n_estimators=100, random_state=42),
    "svr": SVR(kernel='rbf'),
    "decision_tree": DecisionTreeRegressor(random_state=42),
    "gradient_boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
}

CLUSTERING_ALGORITHMS = {
    "kmeans": lambda n_clusters: KMeans(n_clusters=n_clusters, random_state=42),
    "dbscan": lambda: DBSCAN(eps=0.5, min_samples=5),
    "hierarchical": lambda n_clusters: AgglomerativeClustering(n_clusters=n_clusters),
    "gmm": lambda n_clusters: GaussianMixture(n_components=n_clusters, random_state=42),
    "mean_shift": lambda: MeanShift(),
    "spectral": lambda n_clusters: SpectralClustering(n_clusters=n_clusters, random_state=42)
}

class TrainingRequest(BaseModel):
    workspace_id: str
    dataset_id: str
    dataset_content: str
    dataset_format: str
    target_column: Optional[str] = None
    problem_type: str
    algorithms: List[str]
    test_size: float = 0.2
    n_clusters: Optional[int] = 3

class PredictionRequest(BaseModel):
    workspace_id: str
    model_id: str
    input_data: Dict[str, Any]

def parse_dataset(content: str, format: str) -> pd.DataFrame:
    """Parse dataset from different formats"""
    try:
        if format == "csv":
            return pd.read_csv(io.StringIO(content))
        elif format == "json":
            data = json.loads(content)
            if isinstance(data, list):
                return pd.DataFrame(data)
            else:
                return pd.DataFrame([data])
        elif format in ["yml", "yaml"]:
            data = yaml.safe_load(content)
            if isinstance(data, list):
                return pd.DataFrame(data)
            else:
                return pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported format: {format}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")

@app.get("/")
def root():
    return {
        "service": "ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "train": "/train",
            "predict": "/predict",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/train")
async def train_models(request: TrainingRequest):
    """Train ML models with selected algorithms"""
    try:
        # Parse dataset
        df = parse_dataset(request.dataset_content, request.dataset_format)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Dataset is empty")
        
        results = []
        best_model = None
        best_score = -float('inf')
        
        if request.problem_type in ["classification", "regression"]:
            # Supervised Learning
            if not request.target_column or request.target_column not in df.columns:
                raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found")
            
            X = df.drop(columns=[request.target_column])
            y = df[request.target_column]
            
            # Convert categorical columns to numeric
            for col in X.select_dtypes(include=['object']).columns:
                X[col] = pd.Categorical(X[col]).codes
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=request.test_size, random_state=42
            )
            
            # Train each algorithm
            algorithm_map = CLASSIFICATION_ALGORITHMS if request.problem_type == "classification" else REGRESSION_ALGORITHMS
            
            for algo_name in request.algorithms:
                if algo_name not in algorithm_map:
                    continue
                
                try:
                    model = algorithm_map[algo_name]
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                    
                    if request.problem_type == "classification":
                        accuracy = accuracy_score(y_test, y_pred)
                        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
                        cm = confusion_matrix(y_test, y_pred).tolist()
                        
                        score = accuracy
                        metrics = {
                            "accuracy": float(accuracy),
                            "precision": float(precision),
                            "recall": float(recall),
                            "f1_score": float(f1),
                            "confusion_matrix": cm
                        }
                    else:  # regression
                        mse = mean_squared_error(y_test, y_pred)
                        rmse = np.sqrt(mse)
                        mae = mean_absolute_error(y_test, y_pred)
                        r2 = r2_score(y_test, y_pred)
                        
                        score = r2
                        metrics = {
                            "mse": float(mse),
                            "rmse": float(rmse),
                            "mae": float(mae),
                            "r2_score": float(r2)
                        }
                    
                    # Save model
                    model_filename = f"{request.workspace_id}_{request.dataset_id}_{algo_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                    model_path = os.path.join(MODELS_DIR, model_filename)
                    joblib.dump(model, model_path)
                    
                    result = {
                        "algorithm": algo_name,
                        "metrics": metrics,
                        "model_path": model_filename,
                        "feature_names": X.columns.tolist(),
                        "target_column": request.target_column
                    }
                    results.append(result)
                    
                    # Track best model
                    if score > best_score:
                        best_score = score
                        best_model = result
                        
                except Exception as e:
                    results.append({
                        "algorithm": algo_name,
                        "error": str(e)
                    })
        
        else:  # clustering
            # Unsupervised Learning
            X = df.copy()
            
            # Convert categorical columns to numeric
            for col in X.select_dtypes(include=['object']).columns:
                X[col] = pd.Categorical(X[col]).codes
            
            for algo_name in request.algorithms:
                if algo_name not in CLUSTERING_ALGORITHMS:
                    continue
                
                try:
                    if algo_name in ["kmeans", "hierarchical", "gmm", "spectral"]:
                        model = CLUSTERING_ALGORITHMS[algo_name](request.n_clusters or 3)
                    else:
                        model = CLUSTERING_ALGORITHMS[algo_name]()
                    
                    labels = model.fit_predict(X)
                    
                    # Calculate silhouette score
                    if len(np.unique(labels)) > 1:
                        silhouette = silhouette_score(X, labels)
                    else:
                        silhouette = 0.0
                    
                    score = silhouette
                    metrics = {
                        "silhouette_score": float(silhouette),
                        "n_clusters": int(len(np.unique(labels))),
                        "cluster_sizes": {int(k): int(v) for k, v in zip(*np.unique(labels, return_counts=True))}
                    }
                    
                    # Save model
                    model_filename = f"{request.workspace_id}_{request.dataset_id}_{algo_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                    model_path = os.path.join(MODELS_DIR, model_filename)
                    joblib.dump(model, model_path)
                    
                    result = {
                        "algorithm": algo_name,
                        "metrics": metrics,
                        "model_path": model_filename,
                        "feature_names": X.columns.tolist()
                    }
                    results.append(result)
                    
                    # Track best model
                    if score > best_score:
                        best_score = score
                        best_model = result
                        
                except Exception as e:
                    results.append({
                        "algorithm": algo_name,
                        "error": str(e)
                    })
        
        return {
            "status": "success",
            "results": results,
            "best_model": best_model,
            "total_trained": len([r for r in results if "error" not in r]),
            "total_failed": len([r for r in results if "error" in r])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(request: PredictionRequest):
    """Make predictions using trained model"""
    try:
        # Load model
        model_path = os.path.join(MODELS_DIR, request.model_id)
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail="Model not found")
        
        model = joblib.load(model_path)
        
        # Prepare input data
        input_df = pd.DataFrame([request.input_data])
        
        # Convert categorical columns to numeric
        for col in input_df.select_dtypes(include=['object']).columns:
            input_df[col] = pd.Categorical(input_df[col]).codes
        
        # Make prediction
        prediction = model.predict(input_df)
        
        # Get prediction probabilities if available
        probabilities = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_df)
            probabilities = proba[0].tolist()
        
        return {
            "status": "success",
            "prediction": prediction.tolist(),
            "probabilities": probabilities,
            "input": request.input_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/{workspace_id}")
def list_models(workspace_id: str):
    """List all models for a workspace"""
    try:
        models = []
        for filename in os.listdir(MODELS_DIR):
            if filename.startswith(workspace_id) and filename.endswith('.pkl'):
                file_path = os.path.join(MODELS_DIR, filename)
                stat = os.stat(file_path)
                models.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat()
                })
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
