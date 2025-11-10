import pickle
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    """Service for making predictions with trained models"""
    
    def predict(self, model_path, input_data):
        """Make predictions on input data"""
        try:
            # Load model package
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)
            
            model = model_package['model']
            scaler = model_package['scaler']
            label_encoders = model_package.get('label_encoders', {})
            target_encoder = model_package.get('target_encoder')
            feature_columns = model_package['feature_columns']
            problem_type = model_package['problem_type']
            
            # Convert input data to DataFrame
            if isinstance(input_data, dict):
                df = pd.DataFrame([input_data])
            elif isinstance(input_data, list):
                df = pd.DataFrame(input_data)
            else:
                raise ValueError("input_data must be dict or list of dicts")
            
            # Ensure correct column order
            df = df[feature_columns]
            
            # Apply label encoders
            for col, le in label_encoders.items():
                if col in df.columns:
                    df[col] = df[col].map(lambda x: le.transform([str(x)])[0] if x in le.classes_ else -1)
            
            # Scale features
            X_scaled = scaler.transform(df)
            
            # Make predictions
            predictions = model.predict(X_scaled)
            
            # For classification, also get probabilities if available
            probabilities = None
            if problem_type == 'classification' and hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(X_scaled).tolist()
            
            # Decode predictions if target encoder exists
            if target_encoder is not None:
                predictions = target_encoder.inverse_transform(predictions)
            
            result = {
                'predictions': predictions.tolist() if isinstance(predictions, np.ndarray) else predictions,
                'probabilities': probabilities,
                'problem_type': problem_type,
                'n_samples': len(predictions)
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Error making predictions: {str(e)}")
            raise
    
    def predict_batch(self, model_path, file_path):
        """Make predictions on batch file"""
        try:
            # Load data from file
            ext = file_path.rsplit('.', 1)[1].lower()
            
            if ext == 'csv':
                df = pd.read_csv(file_path)
            elif ext == 'json':
                df = pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file format: {ext}")
            
            # Convert to list of dicts
            input_data = df.to_dict('records')
            
            # Make predictions
            result = self.predict(model_path, input_data)
            
            # Add predictions to DataFrame
            df['prediction'] = result['predictions']
            
            if result.get('probabilities'):
                # Add probability columns
                prob_df = pd.DataFrame(
                    result['probabilities'],
                    columns=[f'prob_class_{i}' for i in range(len(result['probabilities'][0]))]
                )
                df = pd.concat([df, prob_df], axis=1)
            
            # Save results
            output_path = file_path.replace(f'.{ext}', '_predictions.csv')
            df.to_csv(output_path, index=False)
            
            return {
                'predictions': result['predictions'],
                'probabilities': result.get('probabilities'),
                'output_path': output_path,
                'n_samples': len(result['predictions'])
            }
        
        except Exception as e:
            logger.error(f"Error making batch predictions: {str(e)}")
            raise
    
    def evaluate_predictions(self, model_path, file_path, target_column):
        """Evaluate model on test data"""
        try:
            # Load model
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)
            
            problem_type = model_package['problem_type']
            
            # Load test data
            ext = file_path.rsplit('.', 1)[1].lower()
            if ext == 'csv':
                df = pd.read_csv(file_path)
            elif ext == 'json':
                df = pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file format: {ext}")
            
            # Separate features and target
            y_true = df[target_column]
            X = df.drop(columns=[target_column])
            
            # Make predictions
            input_data = X.to_dict('records')
            result = self.predict(model_path, input_data)
            y_pred = result['predictions']
            
            # Calculate metrics
            if problem_type == 'classification':
                from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
                
                metrics = {
                    'accuracy': accuracy_score(y_true, y_pred),
                    'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
                    'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
                    'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0),
                    'confusion_matrix': confusion_matrix(y_true, y_pred).tolist()
                }
            else:  # regression
                from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
                
                mse = mean_squared_error(y_true, y_pred)
                metrics = {
                    'mse': mse,
                    'rmse': np.sqrt(mse),
                    'mae': mean_absolute_error(y_true, y_pred),
                    'r2_score': r2_score(y_true, y_pred)
                }
            
            return metrics
        
        except Exception as e:
            logger.error(f"Error evaluating predictions: {str(e)}")
            raise
