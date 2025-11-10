import os
import pandas as pd
import numpy as np
import pickle
import json
import time
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, mean_squared_error,
    r2_score, mean_absolute_error, silhouette_score
)

# Classification algorithms
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

# Regression algorithms
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor

# Clustering algorithms
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, MeanShift, SpectralClustering
from sklearn.mixture import GaussianMixture

# XGBoost
try:
    from xgboost import XGBClassifier, XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logging.warning("XGBoost not available. Install with: pip install xgboost")

logger = logging.getLogger(__name__)

class MLService:
    """Service for ML model training and management"""
    
    def __init__(self):
        self.models_dir = 'models'
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Define available algorithms
        self.classification_algorithms = {
            'random_forest': RandomForestClassifier,
            'xgboost': XGBClassifier if XGBOOST_AVAILABLE else None,
            'gradient_boosting': GradientBoostingClassifier,
            'svm': SVC,
            'logistic_regression': LogisticRegression,
            'decision_tree': DecisionTreeClassifier,
            'knn': KNeighborsClassifier,
            'naive_bayes': GaussianNB
        }
        
        self.regression_algorithms = {
            'linear_regression': LinearRegression,
            'ridge': Ridge,
            'lasso': Lasso,
            'random_forest': RandomForestRegressor,
            'xgboost': XGBRegressor if XGBOOST_AVAILABLE else None,
            'svr': SVR,
            'decision_tree': DecisionTreeRegressor,
            'gradient_boosting': GradientBoostingRegressor
        }
        
        self.clustering_algorithms = {
            'kmeans': KMeans,
            'dbscan': DBSCAN,
            'hierarchical': AgglomerativeClustering,
            'gmm': GaussianMixture,
            'mean_shift': MeanShift,
            'spectral': SpectralClustering
        }
    
    def train_models(self, workspace_id, dataset_id, file_path, problem_type, target_column, algorithms, test_size=0.2):
        """Train multiple ML models"""
        try:
            start_time = time.time()
            
            # Load data
            df = self._load_data(file_path)
            
            # Select algorithm set based on problem type
            if problem_type == 'classification':
                algo_dict = self.classification_algorithms
            elif problem_type == 'regression':
                algo_dict = self.regression_algorithms
            elif problem_type == 'clustering':
                algo_dict = self.clustering_algorithms
            else:
                raise ValueError(f"Invalid problem type: {problem_type}")
            
            # Train each selected algorithm
            results = []
            best_model = None
            best_score = -float('inf')
            
            for algo_name in algorithms:
                if algo_name not in algo_dict:
                    logger.warning(f"Algorithm {algo_name} not found, skipping")
                    continue
                
                algo_class = algo_dict[algo_name]
                if algo_class is None:
                    logger.warning(f"Algorithm {algo_name} not available, skipping")
                    continue
                
                logger.info(f"Training {algo_name} for {problem_type}...")
                
                try:
                    if problem_type in ['classification', 'regression']:
                        result = self._train_supervised(
                            df, algo_name, algo_class, problem_type,
                            target_column, test_size, workspace_id, dataset_id
                        )
                    else:  # clustering
                        result = self._train_unsupervised(
                            df, algo_name, algo_class, workspace_id, dataset_id
                        )
                    
                    results.append(result)
                    
                    # Track best model (by accuracy for classification, r2 for regression, silhouette for clustering)
                    score = result.get('accuracy') or result.get('r2_score') or result.get('silhouette_score', -1)
                    if score > best_score:
                        best_score = score
                        best_model = result
                
                except Exception as e:
                    logger.error(f"Error training {algo_name}: {str(e)}")
                    results.append({
                        'algorithm': algo_name,
                        'status': 'failed',
                        'error': str(e)
                    })
            
            total_time = time.time() - start_time
            
            return {
                'success': True,
                'problem_type': problem_type,
                'results': results,
                'best_model': best_model,
                'total_training_time': round(total_time, 2),
                'models_trained': len([r for r in results if r.get('status') != 'failed'])
            }
        
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            raise
    
    def _train_supervised(self, df, algo_name, algo_class, problem_type, target_column, test_size, workspace_id, dataset_id):
        """Train supervised learning model"""
        start_time = time.time()
        
        # Prepare data
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Handle categorical variables
        label_encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
        
        # Encode target for classification
        target_encoder = None
        if problem_type == 'classification' and y.dtype == 'object':
            target_encoder = LabelEncoder()
            y = target_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Initialize and train model
        if algo_name == 'xgboost':
            model = algo_class(random_state=42, use_label_encoder=False, eval_metric='logloss')
        elif algo_name in ['svm', 'svr']:
            model = algo_class(kernel='rbf')
        elif algo_name == 'knn':
            model = algo_class(n_neighbors=5)
        elif algo_name in ['random_forest', 'gradient_boosting', 'decision_tree']:
            model = algo_class(random_state=42)
        elif algo_name == 'logistic_regression':
            model = algo_class(random_state=42, max_iter=1000)
        else:
            model = algo_class()
        
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        
        # Calculate metrics
        training_time = time.time() - start_time
        
        if problem_type == 'classification':
            metrics = self._calculate_classification_metrics(y_test, y_pred, target_encoder)
        else:
            metrics = self._calculate_regression_metrics(y_test, y_pred)
        
        # Save model
        model_filename = f"model_{workspace_id}_{dataset_id}_{algo_name}_{int(time.time())}.pkl"
        model_path = os.path.join(self.models_dir, model_filename)
        
        model_package = {
            'model': model,
            'scaler': scaler,
            'label_encoders': label_encoders,
            'target_encoder': target_encoder,
            'feature_columns': X.columns.tolist(),
            'algorithm': algo_name,
            'problem_type': problem_type,
            'trained_at': datetime.now().isoformat()
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_package, f)
        
        return {
            'algorithm': algo_name,
            'status': 'success',
            'model_path': model_path,
            'training_time': round(training_time, 2),
            **metrics
        }
    
    def _train_unsupervised(self, df, algo_name, algo_class, workspace_id, dataset_id):
        """Train unsupervised learning (clustering) model"""
        start_time = time.time()
        
        # Prepare data
        X = df.copy()
        
        # Handle categorical variables
        label_encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Initialize and train model
        if algo_name == 'kmeans':
            model = algo_class(n_clusters=3, random_state=42)
        elif algo_name == 'dbscan':
            model = algo_class(eps=0.5, min_samples=5)
        elif algo_name == 'hierarchical':
            model = algo_class(n_clusters=3)
        elif algo_name == 'gmm':
            model = algo_class(n_components=3, random_state=42)
        elif algo_name == 'mean_shift':
            model = algo_class()
        elif algo_name == 'spectral':
            model = algo_class(n_clusters=3, random_state=42)
        else:
            model = algo_class()
        
        # Fit model
        if algo_name == 'gmm':
            labels = model.fit_predict(X_scaled)
        else:
            model.fit(X_scaled)
            labels = model.labels_
        
        # Calculate metrics
        training_time = time.time() - start_time
        
        try:
            silhouette = silhouette_score(X_scaled, labels)
        except:
            silhouette = 0.0
        
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        
        # Save model
        model_filename = f"model_{workspace_id}_{dataset_id}_{algo_name}_{int(time.time())}.pkl"
        model_path = os.path.join(self.models_dir, model_filename)
        
        model_package = {
            'model': model,
            'scaler': scaler,
            'label_encoders': label_encoders,
            'feature_columns': X.columns.tolist(),
            'algorithm': algo_name,
            'problem_type': 'clustering',
            'trained_at': datetime.now().isoformat()
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_package, f)
        
        return {
            'algorithm': algo_name,
            'status': 'success',
            'model_path': model_path,
            'training_time': round(training_time, 2),
            'silhouette_score': round(silhouette, 4),
            'n_clusters': n_clusters,
            'cluster_distribution': {int(k): int(v) for k, v in pd.Series(labels).value_counts().to_dict().items()}
        }
    
    def _calculate_classification_metrics(self, y_test, y_pred, target_encoder=None):
        """Calculate classification metrics"""
        accuracy = accuracy_score(y_test, y_pred)
        
        # For multiclass, use weighted average
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        return {
            'accuracy': round(accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'confusion_matrix': cm.tolist()
        }
    
    def _calculate_regression_metrics(self, y_test, y_pred):
        """Calculate regression metrics"""
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {
            'mse': round(mse, 4),
            'rmse': round(rmse, 4),
            'mae': round(mae, 4),
            'r2_score': round(r2, 4)
        }
    
    def retrain_model(self, model_id, file_path, algorithm, problem_type, target_column=None, test_size=0.2):
        """Retrain existing model with new data"""
        # Similar to train_models but for single model
        # Implementation similar to train_supervised/unsupervised
        pass
    
    def export_model(self, model_path, export_format, output_name='model'):
        """Export model in different formats"""
        try:
            # Load model
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)
            
            base_dir = os.path.dirname(model_path)
            
            if export_format == 'pickle':
                # Already in pickle format
                output_path = os.path.join(base_dir, f"{output_name}.pkl")
                with open(output_path, 'wb') as f:
                    pickle.dump(model_package, f)
            
            elif export_format == 'h5':
                # For Keras/TensorFlow models (if applicable)
                output_path = os.path.join(base_dir, f"{output_name}.h5")
                # Note: sklearn models don't directly export to h5
                # This would require converting to TensorFlow/Keras format
                raise NotImplementedError("H5 export requires TensorFlow/Keras conversion")
            
            else:
                raise ValueError(f"Unsupported export format: {export_format}")
            
            return {
                'success': True,
                'output_path': output_path,
                'format': export_format
            }
        
        except Exception as e:
            logger.error(f"Error exporting model: {str(e)}")
            raise
    
    def get_model_metadata(self, model_path):
        """Get model metadata"""
        try:
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)
            
            file_size = os.path.getsize(model_path)
            
            metadata = {
                'algorithm': model_package.get('algorithm'),
                'problem_type': model_package.get('problem_type'),
                'feature_columns': model_package.get('feature_columns'),
                'trained_at': model_package.get('trained_at'),
                'file_size': file_size,
                'file_path': model_path
            }
            
            return metadata
        
        except Exception as e:
            logger.error(f"Error getting model metadata: {str(e)}")
            raise
    
    def _load_data(self, file_path):
        """Load data from file"""
        ext = file_path.rsplit('.', 1)[1].lower()
        
        if ext == 'csv':
            return pd.read_csv(file_path)
        elif ext == 'json':
            return pd.read_json(file_path)
        elif ext in ['yml', 'yaml']:
            import yaml
            with open(file_path, 'r') as f:
                data = yaml.safe_load(f)
            if isinstance(data, list):
                return pd.DataFrame(data)
            elif isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, list):
                        return pd.DataFrame(value)
                return pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported file format: {ext}")
