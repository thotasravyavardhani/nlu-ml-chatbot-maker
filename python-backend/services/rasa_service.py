import os
import json
import yaml
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class RasaService:
    """Service for Rasa NLU integration"""
    
    def __init__(self):
        self.rasa_dir = 'rasa_models'
        os.makedirs(self.rasa_dir, exist_ok=True)
        self.rasa_available = self._check_rasa_installation()
    
    def _check_rasa_installation(self):
        """Check if Rasa is installed"""
        try:
            import rasa
            return True
        except ImportError:
            logger.warning("Rasa not installed. Install with: pip install rasa")
            return False
    
    def train_nlu(self, workspace_id, training_data):
        """Train Rasa NLU model"""
        try:
            if not self.rasa_available:
                return {
                    'success': False,
                    'error': 'Rasa not installed',
                    'message': 'Please install Rasa: pip install rasa'
                }
            
            from rasa.nlu.training_data import load_data
            from rasa.nlu.model import Trainer
            from rasa.nlu import config
            
            # Create workspace directory
            workspace_dir = os.path.join(self.rasa_dir, f'workspace_{workspace_id}')
            os.makedirs(workspace_dir, exist_ok=True)
            
            # Save training data
            training_file = os.path.join(workspace_dir, 'training_data.yml')
            self._save_training_data(training_file, training_data)
            
            # Create config
            config_file = os.path.join(workspace_dir, 'config.yml')
            self._create_config(config_file)
            
            # Train model
            trainer = Trainer(config.load(config_file))
            training_data_obj = load_data(training_file)
            interpreter = trainer.train(training_data_obj)
            
            # Save model
            model_dir = os.path.join(workspace_dir, 'models')
            os.makedirs(model_dir, exist_ok=True)
            model_path = trainer.persist(model_dir)
            
            return {
                'success': True,
                'model_path': model_path,
                'workspace_dir': workspace_dir,
                'trained_at': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error training Rasa model: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Rasa training failed. Using mock NLU instead.'
            }
    
    def parse_message(self, model_path, message):
        """Parse message using trained Rasa model"""
        try:
            if not self.rasa_available:
                # Return mock response if Rasa not available
                return self._mock_parse_message(message)
            
            from rasa.nlu.model import Interpreter
            
            interpreter = Interpreter.load(model_path)
            result = interpreter.parse(message)
            
            return {
                'text': result['text'],
                'intent': result['intent'],
                'entities': result['entities'],
                'intent_ranking': result.get('intent_ranking', [])
            }
        
        except Exception as e:
            logger.error(f"Error parsing message: {str(e)}")
            return self._mock_parse_message(message)
    
    def chat(self, model_path, message, sender_id='default'):
        """Chat with Rasa bot"""
        try:
            if not self.rasa_available:
                # Return mock response
                return self._mock_chat(message)
            
            from rasa.core.agent import Agent
            
            agent = Agent.load(model_path)
            responses = agent.handle_text(message, sender_id=sender_id)
            
            return {
                'responses': [{'text': r['text']} for r in responses],
                'sender_id': sender_id,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
            return self._mock_chat(message)
    
    def evaluate_model(self, model_path, test_data):
        """Evaluate Rasa model"""
        try:
            if not self.rasa_available:
                return {
                    'success': False,
                    'error': 'Rasa not available',
                    'message': 'Install Rasa to evaluate models'
                }
            
            from rasa.nlu.test import run_evaluation
            
            # Save test data
            test_file = os.path.join(os.path.dirname(model_path), 'test_data.yml')
            self._save_training_data(test_file, test_data)
            
            # Run evaluation
            result = run_evaluation(test_file, model_path)
            
            return {
                'success': True,
                'accuracy': result.get('accuracy'),
                'precision': result.get('precision'),
                'f1_score': result.get('f1_score'),
                'report': result
            }
        
        except Exception as e:
            logger.error(f"Error evaluating model: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_training_data(self, file_path, training_data):
        """Save training data in Rasa NLU format"""
        # Convert training data to Rasa format
        rasa_format = {
            'version': '3.0',
            'nlu': []
        }
        
        if isinstance(training_data, dict):
            # If training_data is already in Rasa format
            rasa_format = training_data
        elif isinstance(training_data, list):
            # Convert list of examples to Rasa format
            for item in training_data:
                if 'intent' in item and 'text' in item:
                    rasa_format['nlu'].append({
                        'intent': item['intent'],
                        'examples': item.get('text') if isinstance(item.get('text'), str) else '\n'.join(item.get('examples', []))
                    })
        
        with open(file_path, 'w') as f:
            yaml.dump(rasa_format, f, default_flow_style=False)
    
    def _create_config(self, config_file):
        """Create Rasa config file"""
        config = {
            'language': 'en',
            'pipeline': [
                {'name': 'WhitespaceTokenizer'},
                {'name': 'RegexFeaturizer'},
                {'name': 'LexicalSyntacticFeaturizer'},
                {'name': 'CountVectorsFeaturizer'},
                {
                    'name': 'CountVectorsFeaturizer',
                    'analyzer': 'char_wb',
                    'min_ngram': 1,
                    'max_ngram': 4
                },
                {'name': 'DIETClassifier', 'epochs': 100},
                {'name': 'EntitySynonymMapper'},
                {'name': 'ResponseSelector', 'epochs': 100}
            ],
            'policies': [
                {'name': 'MemoizationPolicy'},
                {'name': 'TEDPolicy', 'max_history': 5, 'epochs': 100},
                {'name': 'RulePolicy'}
            ]
        }
        
        with open(config_file, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)
    
    def _mock_parse_message(self, message):
        """Mock NLU parsing when Rasa not available"""
        # Simple keyword-based intent detection
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey']):
            intent = 'greet'
            confidence = 0.95
        elif any(word in message_lower for word in ['bye', 'goodbye', 'see you']):
            intent = 'goodbye'
            confidence = 0.93
        elif any(word in message_lower for word in ['thank', 'thanks']):
            intent = 'thanks'
            confidence = 0.91
        elif '?' in message:
            intent = 'question'
            confidence = 0.75
        else:
            intent = 'general'
            confidence = 0.60
        
        return {
            'text': message,
            'intent': {
                'name': intent,
                'confidence': confidence
            },
            'entities': [],
            'intent_ranking': [
                {'name': intent, 'confidence': confidence}
            ]
        }
    
    def _mock_chat(self, message):
        """Mock chat response when Rasa not available"""
        parse_result = self._mock_parse_message(message)
        intent = parse_result['intent']['name']
        
        responses = {
            'greet': 'Hello! How can I help you today?',
            'goodbye': 'Goodbye! Have a great day!',
            'thanks': 'You\'re welcome!',
            'question': 'That\'s an interesting question. Let me help you with that.',
            'general': 'I understand. How can I assist you further?'
        }
        
        response_text = responses.get(intent, 'I\'m here to help. What can I do for you?')
        
        return {
            'responses': [{'text': response_text}],
            'sender_id': 'default',
            'timestamp': datetime.now().isoformat(),
            'intent': parse_result['intent']
        }
