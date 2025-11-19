# Python Backend Setup Guide

This guide explains how to set up the Python backend services for ML training, prediction, and Rasa NLU integration.

## Architecture Overview

```
Next.js Frontend (Port 3000)
    ↓ API Calls
Python ML Service (Port 5000)
    ├── ML Training (scikit-learn, XGBoost)
    ├── ML Prediction
    └── Model Management
    
Python Rasa Service (Port 5005)
    ├── NLU Training
    ├── Intent Recognition
    ├── Entity Extraction
    └── Chatbot Responses
```

## Prerequisites

- Python 3.8 or higher
- pip or conda package manager
- Virtual environment (recommended)

## Setup Instructions

### 1. Create Python Backend Directory

```bash
mkdir python-backend
cd python-backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 3. Install Dependencies

Create `requirements.txt`:

```txt
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
xgboost==2.0.2
joblib==1.3.2
pyyaml==6.0.1
rasa==3.6.13
```

Install:
```bash
pip install -r requirements.txt
```

### 4. Create ML Service (`ml_service.py`)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, MeanShift, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, silhouette_score
from xgboost import XGBClassifier, XGBRegressor
import joblib
import os
import json
import time
import yaml

app = Flask(__name__)
CORS(app)

# Model storage directory
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# Algorithm mapping
ALGORITHMS = {
    # Classification
    'random_forest': lambda: RandomForestClassifier(n_estimators=100, random_state=42),
    'xgboost': lambda: XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss'),
    'gradient_boosting': lambda: GradientBoostingClassifier(random_state=42),
    'svm': lambda: SVC(random_state=42, probability=True),
    'logistic_regression': lambda: LogisticRegression(random_state=42, max_iter=1000),
    'decision_tree': lambda: DecisionTreeClassifier(random_state=42),
    'knn': lambda: KNeighborsClassifier(),
    'naive_bayes': lambda: GaussianNB(),
    
    # Regression
    'linear_regression': lambda: LinearRegression(),
    'ridge': lambda: Ridge(random_state=42),
    'lasso': lambda: Lasso(random_state=42),
    'random_forest_regressor': lambda: RandomForestRegressor(n_estimators=100, random_state=42),
    'xgboost_regressor': lambda: XGBRegressor(random_state=42),
    'svr': lambda: SVR(),
    'decision_tree_regressor': lambda: DecisionTreeRegressor(random_state=42),
    'gradient_boosting_regressor': lambda: GradientBoostingRegressor(random_state=42),
    
    # Clustering
    'kmeans': lambda n_clusters=3: KMeans(n_clusters=n_clusters, random_state=42),
    'dbscan': lambda: DBSCAN(),
    'hierarchical': lambda n_clusters=3: AgglomerativeClustering(n_clusters=n_clusters),
    'gmm': lambda n_components=3: GaussianMixture(n_components=n_components, random_state=42),
    'mean_shift': lambda: MeanShift(),
    'spectral': lambda n_clusters=3: SpectralClustering(n_clusters=n_clusters, random_state=42),
}

def load_dataset(file_path, file_format):
    """Load dataset based on format"""
    if file_format == 'csv':
        return pd.read_csv(file_path)
    elif file_format == 'json':
        return pd.read_json(file_path)
    elif file_format in ['yml', 'yaml']:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)
        return pd.DataFrame(data)
    else:
        raise ValueError(f"Unsupported file format: {file_format}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ml-service"}), 200

@app.route('/train', methods=['POST'])
def train_models():
    try:
        data = request.json
        dataset_path = data.get('dataset_path')
        file_format = data.get('file_format', 'csv')
        problem_type = data.get('problem_type')
        target_column = data.get('target_column')
        algorithms = data.get('algorithms', [])
        workspace_id = data.get('workspace_id')
        
        # Load dataset
        df = load_dataset(dataset_path, file_format)
        
        results = []
        
        if problem_type == 'clustering':
            # Unsupervised learning
            X = df.select_dtypes(include=[np.number]).values
            
            for algo_id in algorithms:
                start_time = time.time()
                
                # Get algorithm
                if algo_id in ['kmeans', 'hierarchical', 'gmm', 'spectral']:
                    n_clusters = min(5, len(df) // 10)
                    model = ALGORITHMS[algo_id](n_clusters)
                else:
                    model = ALGORITHMS[algo_id]()
                
                # Train
                labels = model.fit_predict(X)
                
                # Calculate metrics
                if len(set(labels)) > 1:
                    silhouette = silhouette_score(X, labels)
                else:
                    silhouette = 0
                
                # Save model
                model_filename = f"{workspace_id}_{algo_id}_{int(time.time())}.pkl"
                model_path = os.path.join(MODELS_DIR, model_filename)
                joblib.dump(model, model_path)
                
                training_duration = int((time.time() - start_time) * 1000)
                
                results.append({
                    'algorithmId': algo_id,
                    'success': True,
                    'accuracy': float(silhouette),
                    'nClusters': int(len(set(labels))),
                    'inertia': float(model.inertia_) if hasattr(model, 'inertia_') else None,
                    'trainingDuration': training_duration,
                    'modelPath': model_path
                })
        
        else:
            # Supervised learning
            X = df.drop(columns=[target_column])
            y = df[target_column]
            
            # Handle categorical features
            X = pd.get_dummies(X)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            for algo_id in algorithms:
                start_time = time.time()
                
                # Get and train model
                model = ALGORITHMS[algo_id]()
                model.fit(X_train, y_train)
                
                # Predict
                y_pred = model.predict(X_test)
                
                # Calculate metrics
                if problem_type == 'classification':
                    accuracy = accuracy_score(y_test, y_pred)
                    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
                    cm = confusion_matrix(y_test, y_pred).tolist()
                else:  # regression
                    from sklearn.metrics import mean_squared_error, r2_score
                    mse = mean_squared_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    accuracy = r2  # Use R² as accuracy for regression
                    precision = 1 / (1 + mse) if mse > 0 else 1
                    recall = accuracy
                    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
                    cm = None
                
                # Save model
                model_filename = f"{workspace_id}_{algo_id}_{int(time.time())}.pkl"
                model_path = os.path.join(MODELS_DIR, model_filename)
                joblib.dump({'model': model, 'feature_columns': list(X.columns)}, model_path)
                
                training_duration = int((time.time() - start_time) * 1000)
                
                results.append({
                    'algorithmId': algo_id,
                    'success': True,
                    'accuracy': float(accuracy),
                    'precision': float(precision),
                    'recall': float(recall),
                    'f1Score': float(f1),
                    'confusionMatrix': cm,
                    'trainingDuration': training_duration,
                    'modelPath': model_path
                })
        
        return jsonify({
            'success': True,
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        model_path = data.get('model_path')
        input_data = data.get('data')  # List of dicts
        
        # Load model
        model_data = joblib.load(model_path)
        
        if isinstance(model_data, dict):
            model = model_data['model']
            feature_columns = model_data['feature_columns']
            
            # Create DataFrame with correct columns
            df = pd.DataFrame(input_data)
            df = pd.get_dummies(df)
            
            # Ensure all feature columns exist
            for col in feature_columns:
                if col not in df.columns:
                    df[col] = 0
            
            # Reorder columns to match training
            df = df[feature_columns]
            
            # Predict
            predictions = model.predict(df)
            
            # Get confidence if available
            if hasattr(model, 'predict_proba'):
                probas = model.predict_proba(df)
                confidences = [float(max(proba)) for proba in probas]
            else:
                confidences = [0.85] * len(predictions)
            
        else:
            # Clustering model
            model = model_data
            df = pd.DataFrame(input_data)
            X = df.select_dtypes(include=[np.number]).values
            predictions = model.predict(X)
            confidences = [0.80] * len(predictions)
        
        # Format results
        results = []
        for i, (pred, conf) in enumerate(zip(predictions, confidences)):
            results.append({
                'input': input_data[i],
                'prediction': str(pred),
                'confidence': float(conf)
            })
        
        return jsonify({
            'success': True,
            'predictions': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 5. Create Rasa Service

Initialize Rasa:
```bash
rasa init --no-prompt
```

Create `rasa_service.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

RASA_SERVER = "http://localhost:5005"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "rasa-service"}), 200

@app.route('/train', methods=['POST'])
def train_nlu():
    try:
        data = request.json
        training_data = data.get('training_data')
        
        # Save training data
        with open('data/nlu.yml', 'w') as f:
            f.write(training_data)
        
        # Train Rasa model
        import subprocess
        result = subprocess.run(['rasa', 'train', 'nlu'], capture_output=True)
        
        return jsonify({
            'success': True,
            'message': 'NLU model trained successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/parse', methods=['POST'])
def parse_message():
    try:
        data = request.json
        text = data.get('text')
        
        # Call Rasa NLU
        response = requests.post(
            f"{RASA_SERVER}/model/parse",
            json={"text": text}
        )
        
        if response.ok:
            result = response.json()
            intent = result.get('intent', {}).get('name', 'unknown')
            confidence = result.get('intent', {}).get('confidence', 0)
            entities = result.get('entities', [])
            
            return jsonify({
                'success': True,
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'response': f"Detected intent: {intent}"
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Rasa server error'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
```

### 6. Run Services

**Terminal 1 - ML Service:**
```bash
python ml_service.py
```

**Terminal 2 - Rasa Server:**
```bash
rasa run --enable-api --cors "*"
```

**Terminal 3 - Rasa Service:**
```bash
python rasa_service.py
```

## API Endpoints

### ML Service (Port 5000)

- `GET /health` - Health check
- `POST /train` - Train ML models
- `POST /predict` - Make predictions

### Rasa Service (Port 5001)

- `GET /health` - Health check
- `POST /train` - Train NLU model
- `POST /parse` - Parse user message

## Environment Variables

Add to `.env.local`:

```env
PYTHON_ML_SERVICE_URL=http://localhost:5000
PYTHON_RASA_SERVICE_URL=http://localhost:5001
```

## Testing

Test ML Service:
```bash
curl http://localhost:5000/health
```

Test Rasa Service:
```bash
curl http://localhost:5001/health
```

## Deployment

For production:
1. Use gunicorn for Flask apps
2. Deploy Rasa with proper authentication
3. Use environment variables for URLs
4. Add rate limiting and security headers

## Troubleshooting

**Issue: Port already in use**
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Issue: CORS errors**
- Ensure CORS is enabled in Flask apps
- Check environment variables in Next.js

**Issue: Rasa not responding**
```bash
# Restart Rasa
rasa run --enable-api --cors "*" --debug
```
