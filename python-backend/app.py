from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from services.dataset_service import DatasetService
from services.ml_service import MLService
from services.prediction_service import PredictionService
from services.rasa_service import RasaService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize services
dataset_service = DatasetService()
ml_service = MLService()
prediction_service = PredictionService()
rasa_service = RasaService()

# Create necessary directories
os.makedirs('uploads', exist_ok=True)
os.makedirs('models', exist_ok=True)
os.makedirs('rasa_models', exist_ok=True)

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - Welcome message"""
    return jsonify({
        'message': 'NLU Studio Python ML Backend',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'datasets': '/api/datasets/*',
            'ml': '/api/ml/*',
            'models': '/api/models/*',
            'rasa': '/api/rasa/*'
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Python ML Backend is running'}), 200

# ============= Dataset Endpoints =============

@app.route('/api/datasets/parse', methods=['POST'])
def parse_dataset():
    """Parse and validate dataset (CSV, JSON, YML)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        workspace_id = request.form.get('workspace_id')
        
        if not workspace_id:
            return jsonify({'error': 'workspace_id is required'}), 400
        
        result = dataset_service.parse_file(file, workspace_id)
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error parsing dataset: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/preview', methods=['POST'])
def preview_dataset():
    """Get preview of dataset"""
    try:
        data = request.json
        file_path = data.get('file_path')
        
        if not file_path:
            return jsonify({'error': 'file_path is required'}), 400
        
        preview = dataset_service.get_preview(file_path)
        return jsonify(preview), 200
    
    except Exception as e:
        logger.error(f"Error previewing dataset: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= ML Training Endpoints =============

@app.route('/api/ml/train', methods=['POST'])
def train_models():
    """Train multiple ML models"""
    try:
        data = request.json
        
        # Validate required fields
        required = ['workspace_id', 'dataset_id', 'file_path', 'problem_type', 'algorithms']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Train models
        results = ml_service.train_models(
            workspace_id=data['workspace_id'],
            dataset_id=data['dataset_id'],
            file_path=data['file_path'],
            problem_type=data['problem_type'],
            target_column=data.get('target_column'),
            algorithms=data['algorithms'],
            test_size=data.get('test_size', 0.2)
        )
        
        return jsonify(results), 200
    
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/retrain', methods=['POST'])
def retrain_model():
    """Retrain existing model with new data"""
    try:
        data = request.json
        
        required = ['model_id', 'file_path', 'algorithm', 'problem_type']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        result = ml_service.retrain_model(
            model_id=data['model_id'],
            file_path=data['file_path'],
            algorithm=data['algorithm'],
            problem_type=data['problem_type'],
            target_column=data.get('target_column'),
            test_size=data.get('test_size', 0.2)
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error retraining model: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= Prediction Endpoints =============

@app.route('/api/ml/predict', methods=['POST'])
def predict():
    """Make predictions using trained model"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'input_data' not in data:
            return jsonify({'error': 'model_path and input_data are required'}), 400
        
        predictions = prediction_service.predict(
            model_path=data['model_path'],
            input_data=data['input_data']
        )
        
        return jsonify(predictions), 200
    
    except Exception as e:
        logger.error(f"Error making predictions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predict-batch', methods=['POST'])
def predict_batch():
    """Make batch predictions from file"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'file_path' not in data:
            return jsonify({'error': 'model_path and file_path are required'}), 400
        
        predictions = prediction_service.predict_batch(
            model_path=data['model_path'],
            file_path=data['file_path']
        )
        
        return jsonify(predictions), 200
    
    except Exception as e:
        logger.error(f"Error making batch predictions: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= Model Management Endpoints =============

@app.route('/api/models/export', methods=['POST'])
def export_model():
    """Export model as pickle or h5"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'export_format' not in data:
            return jsonify({'error': 'model_path and export_format are required'}), 400
        
        model_path = data['model_path']
        export_format = data['export_format']
        
        # Validate format
        if export_format not in ['pickle', 'h5']:
            return jsonify({'error': 'export_format must be "pickle" or "h5"'}), 400
        
        # Check if model file exists
        if not os.path.exists(model_path):
            return jsonify({'error': f'Model file not found: {model_path}'}), 404
        
        # For pickle format, return the file directly
        if export_format == 'pickle':
            from flask import send_file
            return send_file(
                model_path,
                mimetype='application/octet-stream',
                as_attachment=True,
                download_name=os.path.basename(model_path)
            )
        
        # For h5 format, we'd need to convert (not implemented for sklearn models)
        elif export_format == 'h5':
            return jsonify({'error': 'H5 export not supported for sklearn models'}), 400
    
    except Exception as e:
        logger.error(f"Error exporting model: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/metadata', methods=['POST'])
def get_model_metadata():
    """Get model metadata and details"""
    try:
        data = request.json
        
        if 'model_path' not in data:
            return jsonify({'error': 'model_path is required'}), 400
        
        metadata = ml_service.get_model_metadata(data['model_path'])
        return jsonify(metadata), 200
    
    except Exception as e:
        logger.error(f"Error getting model metadata: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= Rasa NLU Endpoints =============

@app.route('/api/rasa/train', methods=['POST'])
def train_rasa():
    """Train Rasa NLU model"""
    try:
        data = request.json
        
        if 'workspace_id' not in data or 'training_data' not in data:
            return jsonify({'error': 'workspace_id and training_data are required'}), 400
        
        result = rasa_service.train_nlu(
            workspace_id=data['workspace_id'],
            training_data=data['training_data']
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error training Rasa model: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rasa/parse', methods=['POST'])
def parse_message():
    """Parse message using trained Rasa model"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'message' not in data:
            return jsonify({'error': 'model_path and message are required'}), 400
        
        result = rasa_service.parse_message(
            model_path=data['model_path'],
            message=data['message']
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error parsing message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rasa/chat', methods=['POST'])
def chat():
    """Chat with Rasa bot"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'message' not in data:
            return jsonify({'error': 'model_path and message are required'}), 400
        
        response = rasa_service.chat(
            model_path=data['model_path'],
            message=data['message'],
            sender_id=data.get('sender_id', 'default')
        )
        
        return jsonify(response), 200
    
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rasa/evaluate', methods=['POST'])
def evaluate_rasa():
    """Evaluate Rasa model"""
    try:
        data = request.json
        
        if 'model_path' not in data or 'test_data' not in data:
            return jsonify({'error': 'model_path and test_data are required'}), 400
        
        result = rasa_service.evaluate_model(
            model_path=data['model_path'],
            test_data=data['test_data']
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error evaluating Rasa model: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)