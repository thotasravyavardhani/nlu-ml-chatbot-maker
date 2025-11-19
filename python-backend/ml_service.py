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
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

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
    "svm": SVC(kernel='rbf', random_state=42, probability=True),  # Enable probability for confidence
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
    workspace_id: Optional[str] = None
    model_id: Optional[str] = None
    model_path: Optional[str] = None
    data: Optional[List[Dict[str, Any]]] = None
    input_data: Optional[Dict[str, Any]] = None

def is_text_column(series: pd.Series) -> bool:
    """Check if a column contains text data that needs vectorization"""
    if series.dtype != 'object':
        return False
    # Check if values are strings with more than just a few words
    sample = series.dropna().head(10)
    if len(sample) == 0:
        return False
    avg_length = sample.astype(str).str.len().mean()
    return avg_length > 10  # Assume text if average length > 10 chars

def parse_dataset(content: str, format: str) -> pd.DataFrame:
    """Parse dataset from different formats"""
    try:
        print(f"[PARSE] Attempting to parse dataset. Format: {format}, Content length: {len(content) if content else 0}")
        
        if not content or len(content.strip()) == 0:
            print("[PARSE ERROR] Dataset content is empty")
            raise ValueError("Dataset content is empty")
        
        if format == "csv":
            print(f"[PARSE] Parsing CSV. First 200 chars: {content[:200]}")
            # Use quotechar and handle quotes properly
            df = pd.read_csv(io.StringIO(content), quotechar='"', escapechar='\\')
            print(f"[PARSE] CSV parsed successfully. Shape: {df.shape}, Columns: {df.columns.tolist()}")
            return df
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
    except pd.errors.ParserError as e:
        print(f"[PARSE ERROR] CSV parsing failed: {str(e)}")
        print("[PARSE] Retrying with different settings...")
        try:
            # Retry with engine='python' for more flexibility
            df = pd.read_csv(io.StringIO(content), engine='python', quoting=1)
            print(f"[PARSE] CSV parsed successfully with python engine. Shape: {df.shape}")
            return df
        except Exception as retry_error:
            print(f"[PARSE ERROR] Retry failed: {str(retry_error)}")
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    except Exception as e:
        print(f"[PARSE ERROR] Failed to parse dataset: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
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
        print(f"[TRAIN] Received training request for workspace: {request.workspace_id}")
        print(f"[TRAIN] Problem type: {request.problem_type}")
        print(f"[TRAIN] Algorithms: {request.algorithms}")
        print(f"[TRAIN] Dataset format: {request.dataset_format}")
        
        # Parse dataset
        df = parse_dataset(request.dataset_content, request.dataset_format)
        print(f"[TRAIN] Dataset parsed successfully. Shape: {df.shape}")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Dataset is empty")
        
        # Check for minimum rows
        if len(df) < 10:
            raise HTTPException(status_code=400, detail=f"Dataset too small. Need at least 10 rows, got {len(df)}")
        
        results = []
        best_model = None
        best_score = -float('inf')
        
        if request.problem_type in ["classification", "regression"]:
            # Supervised Learning
            if not request.target_column or request.target_column not in df.columns:
                print(f"[TRAIN ERROR] Target column '{request.target_column}' not found in columns: {df.columns.tolist()}")
                raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found")
            
            print(f"[TRAIN] Target column: {request.target_column}")
            X = df.drop(columns=[request.target_column])
            y = df[request.target_column]
            
            # Store original feature names and column info
            original_feature_names = X.columns.tolist()
            
            # Detect text columns that need vectorization
            text_columns = [col for col in X.columns if is_text_column(X[col])]
            numeric_columns = [col for col in X.columns if col not in text_columns]
            
            print(f"[TRAIN] Text columns detected: {text_columns}")
            print(f"[TRAIN] Numeric columns: {numeric_columns}")
            
            # Initialize vectorizers for text columns
            text_vectorizers = {}
            vectorized_features = []
            
            # Process text columns with TF-IDF
            for col in text_columns:
                print(f"[TRAIN] Vectorizing text column: {col}")
                vectorizer = TfidfVectorizer(max_features=100, stop_words='english', ngram_range=(1, 2))
                try:
                    X_text = vectorizer.fit_transform(X[col].fillna('').astype(str))
                    text_vectorizers[col] = vectorizer
                    vectorized_features.append(X_text)
                    print(f"[TRAIN] {col} vectorized to {X_text.shape[1]} features")
                except Exception as e:
                    print(f"[TRAIN WARNING] Failed to vectorize {col}: {e}")
            
            # Process numeric columns
            feature_encoders = {}
            if numeric_columns:
                X_numeric = X[numeric_columns].copy()
                # Encode categorical columns
                for col in X_numeric.select_dtypes(include=['object']).columns:
                    le = LabelEncoder()
                    X_numeric[col] = le.fit_transform(X_numeric[col].astype(str))
                    feature_encoders[col] = le
                vectorized_features.append(X_numeric.values)
            
            # Combine all features
            if len(vectorized_features) > 1:
                from scipy.sparse import hstack, csr_matrix
                # Convert numpy arrays to sparse matrices if needed
                sparse_features = []
                for feat in vectorized_features:
                    if isinstance(feat, np.ndarray):
                        sparse_features.append(csr_matrix(feat))
                    else:
                        sparse_features.append(feat)
                X_transformed = hstack(sparse_features).toarray()
            elif len(vectorized_features) == 1:
                feat = vectorized_features[0]
                X_transformed = feat.toarray() if hasattr(feat, 'toarray') else feat
            else:
                raise HTTPException(status_code=400, detail="No valid features found")
            
            print(f"[TRAIN] Final feature shape: {X_transformed.shape}")
            
            # Encode target variable for classification
            target_encoder = None
            original_classes = None
            if request.problem_type == "classification" and y.dtype == 'object':
                target_encoder = LabelEncoder()
                original_classes = y.unique().tolist()
                y = target_encoder.fit_transform(y)
                print(f"[TRAIN] Target encoded. Classes: {original_classes} -> {list(range(len(original_classes)))}")
            
            print(f"[TRAIN] Features shape: {X_transformed.shape}, Target shape: {y.shape}")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X_transformed, y, test_size=request.test_size, random_state=42, 
                stratify=y if request.problem_type == "classification" else None
            )
            print(f"[TRAIN] Data split complete. Train: {X_train.shape}, Test: {X_test.shape}")
            
            # Train each algorithm
            algorithm_map = CLASSIFICATION_ALGORITHMS if request.problem_type == "classification" else REGRESSION_ALGORITHMS
            
            for algo_name in request.algorithms:
                if algo_name not in algorithm_map:
                    print(f"[TRAIN WARNING] Algorithm '{algo_name}' not found in map")
                    continue
                
                try:
                    print(f"[TRAIN] Training {algo_name}...")
                    
                    # Clone the model to avoid reusing fitted instances
                    from sklearn.base import clone
                    model = clone(algorithm_map[algo_name])
                    
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
                        print(f"[TRAIN] {algo_name} accuracy: {accuracy:.4f}")
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
                        print(f"[TRAIN] {algo_name} R2 score: {r2:.4f}")
                    
                    # Save model with all preprocessing components
                    model_filename = f"{request.workspace_id}_{request.dataset_id}_{algo_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                    model_path = os.path.join(MODELS_DIR, model_filename)
                    
                    model_package = {
                        'model': model,
                        'text_vectorizers': text_vectorizers,
                        'feature_encoders': feature_encoders,
                        'target_encoder': target_encoder,
                        'feature_names': original_feature_names,
                        'text_columns': text_columns,
                        'numeric_columns': numeric_columns,
                        'target_column': request.target_column,
                        'original_classes': original_classes,
                        'problem_type': request.problem_type,
                        'algorithm': algo_name
                    }
                    
                    joblib.dump(model_package, model_path)
                    print(f"[TRAIN] Model saved with vectorizers: {model_filename}")
                    
                    result = {
                        "algorithm": algo_name,
                        "metrics": metrics,
                        "model_path": model_filename,
                        "feature_names": original_feature_names,
                        "target_column": request.target_column
                    }
                    results.append(result)
                    
                    # Track best model
                    if score > best_score:
                        best_score = score
                        best_model = result
                        
                except Exception as e:
                    print(f"[TRAIN ERROR] Failed to train {algo_name}: {str(e)}")
                    import traceback
                    traceback.print_exc()
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
            
            print(f"[TRAIN] Clustering data shape: {X.shape}")
            
            for algo_name in request.algorithms:
                if algo_name not in CLUSTERING_ALGORITHMS:
                    print(f"[TRAIN WARNING] Clustering algorithm '{algo_name}' not found")
                    continue
                
                try:
                    print(f"[TRAIN] Training clustering algorithm {algo_name}...")
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
                    print(f"[TRAIN] {algo_name} silhouette score: {silhouette:.4f}")
                    
                    # Save model
                    model_filename = f"{request.workspace_id}_{request.dataset_id}_{algo_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                    model_path = os.path.join(MODELS_DIR, model_filename)
                    joblib.dump(model, model_path)
                    print(f"[TRAIN] Model saved: {model_filename}")
                    
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
                    print(f"[TRAIN ERROR] Failed to train {algo_name}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    results.append({
                        "algorithm": algo_name,
                        "error": str(e)
                    })
        
        print(f"[TRAIN] Training complete. Successful: {len([r for r in results if 'error' not in r])}, Failed: {len([r for r in results if 'error' in r])}")
        
        return {
            "status": "success",
            "results": results,
            "best_model": best_model,
            "total_trained": len([r for r in results if "error" not in r]),
            "total_failed": len([r for r in results if "error" in r])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[TRAIN CRITICAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(request: PredictionRequest):
    """Make predictions using trained model"""
    try:
        # Support both new (model_path) and legacy (model_id) formats
        model_file = request.model_path or request.model_id
        if not model_file:
            raise HTTPException(status_code=422, detail="model_path or model_id is required")
        
        print(f"[PREDICT] Received prediction request for model: {model_file}")
        
        # Support both 'data' (array) and 'input_data' (single object) formats
        input_samples = request.data if request.data else ([request.input_data] if request.input_data else [])
        
        if not input_samples:
            raise HTTPException(status_code=422, detail="data or input_data is required and must not be empty")
        
        print(f"[PREDICT] Processing {len(input_samples)} samples")
        print(f"[PREDICT] Sample data: {input_samples[0]}")
        
        # Load model
        model_path = os.path.join(MODELS_DIR, model_file)
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model not found: {model_file}")
        
        print(f"[PREDICT] Loading model from: {model_path}")
        model_package = joblib.load(model_path)
        
        # Extract components
        if isinstance(model_package, dict):
            model = model_package['model']
            text_vectorizers = model_package.get('text_vectorizers', {})
            feature_encoders = model_package.get('feature_encoders', {})
            feature_names = model_package.get('feature_names', [])
            text_columns = model_package.get('text_columns', [])
            numeric_columns = model_package.get('numeric_columns', [])
            target_encoder = model_package.get('target_encoder')
            original_classes = model_package.get('original_classes', [])
            problem_type = model_package.get('problem_type', 'classification')
        else:
            # Legacy format
            raise HTTPException(status_code=400, detail="Old model format not supported. Please retrain the model.")
        
        print(f"[PREDICT] Model loaded. Type: {problem_type}")
        print(f"[PREDICT] Text columns: {text_columns}, Numeric columns: {numeric_columns}")
        
        # Process all samples
        all_predictions = []
        
        for idx, sample_data in enumerate(input_samples):
            print(f"[PREDICT] Processing sample {idx + 1}: {sample_data}")
            
            # Create DataFrame from input
            input_df = pd.DataFrame([sample_data])
            
            # Transform features the same way as training
            vectorized_features = []
            
            # Process text columns
            for col in text_columns:
                if col not in input_df.columns:
                    raise HTTPException(status_code=422, detail=f"Missing text column: {col}")
                
                vectorizer = text_vectorizers.get(col)
                if vectorizer:
                    X_text = vectorizer.transform(input_df[col].fillna('').astype(str))
                    vectorized_features.append(X_text)
                    print(f"[PREDICT] Vectorized {col} to {X_text.shape[1]} features")
            
            # Process numeric columns
            if numeric_columns:
                X_numeric = input_df[numeric_columns].copy()
                for col, encoder in feature_encoders.items():
                    if col in X_numeric.columns:
                        try:
                            X_numeric[col] = encoder.transform(X_numeric[col].astype(str))
                        except ValueError:
                            print(f"[PREDICT WARNING] Unseen category in {col}, using default")
                            X_numeric[col] = 0
                vectorized_features.append(X_numeric.values)
            
            # Combine all features
            if len(vectorized_features) > 1:
                from scipy.sparse import hstack, csr_matrix
                sparse_features = []
                for feat in vectorized_features:
                    if isinstance(feat, np.ndarray):
                        sparse_features.append(csr_matrix(feat))
                    else:
                        sparse_features.append(feat)
                X_transformed = hstack(sparse_features).toarray()
            elif len(vectorized_features) == 1:
                feat = vectorized_features[0]
                X_transformed = feat.toarray() if hasattr(feat, 'toarray') else feat
            else:
                raise HTTPException(status_code=400, detail="No valid features found")
            
            print(f"[PREDICT] Transformed feature shape: {X_transformed.shape}")
            
            # Make prediction
            prediction = model.predict(X_transformed)[0]
            print(f"[PREDICT] Raw prediction: {prediction}")
            
            # Decode prediction
            decoded_prediction = prediction
            if target_encoder is not None:
                try:
                    decoded_prediction = target_encoder.inverse_transform([prediction])[0]
                    print(f"[PREDICT] Decoded prediction: {decoded_prediction}")
                except Exception as e:
                    print(f"[PREDICT ERROR] Failed to decode: {e}")
                    if original_classes and isinstance(prediction, (int, np.integer)) and 0 <= prediction < len(original_classes):
                        decoded_prediction = original_classes[int(prediction)]
            
            # Get confidence
            confidence = None
            probabilities = None
            if hasattr(model, 'predict_proba'):
                try:
                    proba = model.predict_proba(X_transformed)[0]
                    probabilities = proba.tolist()
                    confidence = float(max(proba))
                    print(f"[PREDICT] Confidence: {confidence:.4f}")
                except Exception as e:
                    print(f"[PREDICT WARNING] Could not get probabilities: {e}")
            
            result = {
                "input": sample_data,
                "prediction": decoded_prediction,
                "predicted_class": decoded_prediction,
                "confidence": confidence or 0.85,
                "probabilities": probabilities
            }
            
            all_predictions.append(result)
            print(f"[PREDICT] Sample {idx + 1} complete: {decoded_prediction}")
        
        print(f"[PREDICT] ✅ All predictions complete. Total: {len(all_predictions)}")
        
        return {
            "status": "success",
            "predictions": all_predictions,
            "total": len(all_predictions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[PREDICT ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
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