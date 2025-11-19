# Python ML Backend

Dynamic Python backend for NLU + ML platform with Flask API.

## Features

- **Multi-format Dataset Support**: CSV, JSON, YAML
- **ML Algorithms**: 
  - Supervised Classification (8 algorithms)
  - Supervised Regression (8 algorithms)
  - Unsupervised Clustering (6 algorithms)
- **Rasa NLU Integration**: Chatbot training and intent detection
- **Model Export**: Pickle and H5 formats
- **Real-time Predictions**: Single and batch predictions

## Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Optional: Install Rasa for NLU features
pip install rasa==3.6.13
```

## Running the Server

```bash
# Development
python app.py

# Production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Dataset Operations
- `POST /api/datasets/parse` - Parse and validate dataset (CSV/JSON/YML)
- `POST /api/datasets/preview` - Get dataset preview

### ML Training
- `POST /api/ml/train` - Train multiple ML models
- `POST /api/ml/retrain` - Retrain existing model

### Predictions
- `POST /api/ml/predict` - Make single/multiple predictions
- `POST /api/ml/predict-batch` - Batch predictions from file

### Model Management
- `POST /api/models/export` - Export model (pickle/h5)
- `POST /api/models/metadata` - Get model metadata

### Rasa NLU
- `POST /api/rasa/train` - Train Rasa NLU model
- `POST /api/rasa/parse` - Parse message with NLU
- `POST /api/rasa/chat` - Chat with Rasa bot
- `POST /api/rasa/evaluate` - Evaluate Rasa model

## Algorithms Supported

### Classification
- Random Forest
- XGBoost
- Gradient Boosting
- SVM
- Logistic Regression
- Decision Tree
- K-Nearest Neighbors
- Naive Bayes

### Regression
- Linear Regression
- Ridge Regression
- Lasso Regression
- Random Forest Regressor
- XGBoost Regressor
- Support Vector Regression
- Decision Tree Regressor
- Gradient Boosting Regressor

### Clustering
- K-Means
- DBSCAN
- Hierarchical Clustering
- Gaussian Mixture Models
- Mean Shift
- Spectral Clustering

## Directory Structure

```
python-backend/
├── app.py                  # Main Flask application
├── services/
│   ├── dataset_service.py  # Dataset processing
│   ├── ml_service.py       # ML training
│   ├── prediction_service.py # Predictions
│   └── rasa_service.py     # Rasa NLU integration
├── uploads/                # Uploaded datasets
├── models/                 # Trained ML models
├── rasa_models/           # Rasa NLU models
└── requirements.txt        # Python dependencies
```

## Notes

- Rasa is optional. If not installed, mock NLU responses will be provided.
- XGBoost is included by default. Install with: `pip install xgboost`
- For production, use gunicorn or similar WSGI server
- Adjust CORS settings in app.py for production deployment
