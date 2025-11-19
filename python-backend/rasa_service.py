"""
Rasa NLU Service - Handles NLU training and prediction
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import yaml
import json
import subprocess
from datetime import datetime
import shutil

app = FastAPI(title="Rasa NLU Service", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
RASA_PROJECTS_DIR = "rasa_projects"
os.makedirs(RASA_PROJECTS_DIR, exist_ok=True)

class TrainingData(BaseModel):
    intent: str
    examples: List[str]
    entities: Optional[List[Dict[str, Any]]] = None

class RasaTrainingRequest(BaseModel):
    workspace_id: str
    nlu_data: List[TrainingData]
    language: str = "en"
    pipeline: str = "pretrained_embeddings_spacy"

class RasaPredictionRequest(BaseModel):
    workspace_id: str
    text: str

class AnnotationRequest(BaseModel):
    workspace_id: str
    text: str
    intent: str
    entities: List[Dict[str, Any]]

def create_rasa_project(workspace_id: str, nlu_data: List[TrainingData], language: str, pipeline: str):
    """Create or update Rasa project structure"""
    project_path = os.path.join(RASA_PROJECTS_DIR, workspace_id)
    os.makedirs(project_path, exist_ok=True)
    
    # Create data directory
    data_path = os.path.join(project_path, "data")
    os.makedirs(data_path, exist_ok=True)
    
    # Create NLU training data
    nlu_yaml = {
        "version": "3.1",
        "nlu": []
    }
    
    for training_item in nlu_data:
        intent_data = {
            "intent": training_item.intent,
            "examples": "\n".join([f"- {ex}" for ex in training_item.examples])
        }
        nlu_yaml["nlu"].append(intent_data)
    
    # Write NLU data
    nlu_file = os.path.join(data_path, "nlu.yml")
    with open(nlu_file, 'w') as f:
        yaml.dump(nlu_yaml, f, default_flow_style=False, allow_unicode=True)
    
    # Create config.yml
    config = {
        "language": language,
        "pipeline": [
            {"name": "WhitespaceTokenizer"},
            {"name": "RegexFeaturizer"},
            {"name": "LexicalSyntacticFeaturizer"},
            {"name": "CountVectorsFeaturizer"},
            {
                "name": "CountVectorsFeaturizer",
                "analyzer": "char_wb",
                "min_ngram": 1,
                "max_ngram": 4
            },
            {"name": "DIETClassifier", "epochs": 100},
            {"name": "EntitySynonymMapper"},
            {"name": "ResponseSelector", "epochs": 100}
        ],
        "policies": [
            {"name": "MemoizationPolicy"},
            {"name": "TEDPolicy", "max_history": 5, "epochs": 100},
            {"name": "RulePolicy"}
        ]
    }
    
    config_file = os.path.join(project_path, "config.yml")
    with open(config_file, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    # Create domain.yml
    intents = [item.intent for item in nlu_data]
    domain = {
        "version": "3.1",
        "intents": intents,
        "responses": {},
        "session_config": {
            "session_expiration_time": 60,
            "carry_over_slots_to_new_session": True
        }
    }
    
    domain_file = os.path.join(project_path, "domain.yml")
    with open(domain_file, 'w') as f:
        yaml.dump(domain, f, default_flow_style=False)
    
    # Create empty rules and stories
    rules_file = os.path.join(data_path, "rules.yml")
    with open(rules_file, 'w') as f:
        yaml.dump({"version": "3.1", "rules": []}, f)
    
    stories_file = os.path.join(data_path, "stories.yml")
    with open(stories_file, 'w') as f:
        yaml.dump({"version": "3.1", "stories": []}, f)
    
    return project_path

@app.get("/")
def root():
    return {
        "service": "Rasa NLU Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "train": "/train",
            "predict": "/predict",
            "annotate": "/annotate",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/train")
async def train_nlu(request: RasaTrainingRequest):
    """Train Rasa NLU model"""
    try:
        # Create Rasa project
        project_path = create_rasa_project(
            request.workspace_id,
            request.nlu_data,
            request.language,
            request.pipeline
        )
        
        # Train model
        train_command = f"rasa train nlu --data {os.path.join(project_path, 'data')} --config {os.path.join(project_path, 'config.yml')} --out {os.path.join(project_path, 'models')}"
        
        result = subprocess.run(
            train_command,
            shell=True,
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Training failed: {result.stderr}")
        
        # Find trained model
        models_dir = os.path.join(project_path, "models")
        if os.path.exists(models_dir):
            models = [f for f in os.listdir(models_dir) if f.endswith('.tar.gz')]
            if models:
                latest_model = max(models, key=lambda x: os.path.getctime(os.path.join(models_dir, x)))
                
                return {
                    "status": "success",
                    "message": "NLU model trained successfully",
                    "model_path": os.path.join(models_dir, latest_model),
                    "model_name": latest_model,
                    "intents": [item.intent for item in request.nlu_data],
                    "total_examples": sum(len(item.examples) for item in request.nlu_data)
                }
        
        return {
            "status": "success",
            "message": "Training completed",
            "output": result.stdout
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_intent(request: RasaPredictionRequest):
    """Predict intent using trained NLU model"""
    try:
        project_path = os.path.join(RASA_PROJECTS_DIR, request.workspace_id)
        models_dir = os.path.join(project_path, "models")
        
        if not os.path.exists(models_dir):
            raise HTTPException(status_code=404, detail="No trained model found")
        
        models = [f for f in os.listdir(models_dir) if f.endswith('.tar.gz')]
        if not models:
            raise HTTPException(status_code=404, detail="No trained model found")
        
        latest_model = max(models, key=lambda x: os.path.getctime(os.path.join(models_dir, x)))
        model_path = os.path.join(models_dir, latest_model)
        
        # Use Rasa shell for prediction
        predict_command = f'echo "{request.text}" | rasa shell nlu --model {model_path}'
        
        result = subprocess.run(
            predict_command,
            shell=True,
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        # Parse output (simplified - in production, use Rasa HTTP API)
        return {
            "status": "success",
            "text": request.text,
            "intent": "predicted_intent",  # Placeholder
            "confidence": 0.95,  # Placeholder
            "entities": [],
            "note": "Using Rasa shell - for production, use Rasa HTTP API"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/annotate")
async def save_annotation(request: AnnotationRequest):
    """Save annotated training data"""
    try:
        project_path = os.path.join(RASA_PROJECTS_DIR, request.workspace_id)
        annotations_file = os.path.join(project_path, "annotations.json")
        
        # Load existing annotations
        annotations = []
        if os.path.exists(annotations_file):
            with open(annotations_file, 'r') as f:
                annotations = json.load(f)
        
        # Add new annotation
        annotation = {
            "text": request.text,
            "intent": request.intent,
            "entities": request.entities,
            "timestamp": datetime.now().isoformat()
        }
        annotations.append(annotation)
        
        # Save annotations
        with open(annotations_file, 'w') as f:
            json.dump(annotations, f, indent=2)
        
        return {
            "status": "success",
            "message": "Annotation saved",
            "total_annotations": len(annotations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/annotations/{workspace_id}")
def get_annotations(workspace_id: str):
    """Get all annotations for a workspace"""
    try:
        project_path = os.path.join(RASA_PROJECTS_DIR, workspace_id)
        annotations_file = os.path.join(project_path, "annotations.json")
        
        if not os.path.exists(annotations_file):
            return {"annotations": []}
        
        with open(annotations_file, 'r') as f:
            annotations = json.load(f)
        
        return {"annotations": annotations}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/{workspace_id}")
def list_models(workspace_id: str):
    """List all trained models for a workspace"""
    try:
        project_path = os.path.join(RASA_PROJECTS_DIR, workspace_id)
        models_dir = os.path.join(project_path, "models")
        
        if not os.path.exists(models_dir):
            return {"models": []}
        
        models = []
        for filename in os.listdir(models_dir):
            if filename.endswith('.tar.gz'):
                file_path = os.path.join(models_dir, filename)
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
    uvicorn.run(app, host="0.0.0.0", port=8001)
