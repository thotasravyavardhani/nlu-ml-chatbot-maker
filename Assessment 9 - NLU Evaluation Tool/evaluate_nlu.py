# ====================================================================
# evaluate_nlu.py: Full Code for NLU Evaluation 
# NOTE: This code requires 'snips-nlu', 'scikit-learn', and 'seqeval' libraries.
# ====================================================================

import io
import json
import warnings
# You would need to install snips_nlu for this part to work:
# from snips_nlu import SnipsNLUEngine 
# from snips_nlu.default_configs import CONFIG_EN

from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
# For Entity Evaluation, install and use seqeval:
# from seqeval.metrics import classification_report as seq_classification_report 

# --- NLU ENGINE SETUP AND TRAINING ---
def train_engine():
    """Loads the dataset.json and trains the NLU engine."""
    # Placeholder for actual training logic
    # ... Your Snips NLU training code here ...
    print("Training Complete (requires snips-nlu library).")
    return None # Returns the trained engine

# --- EVALUATION CORE FUNCTION ---
# evaluate_nlu.py

import io
import json
import warnings
# Requires: snips_nlu, scikit-learn
# from snips_nlu import SnipsNLUEngine
# from snips_nlu.default_configs import CONFIG_EN

from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# --- NLU ENGINE SETUP AND TRAINING (Use your Snips NLU logic here) ---
# def train_engine():
#     ... (Implementation from chatbot_app.py) ...
#     return trained_engine

# --- EVALUATION CORE FUNCTION ---
def evaluate_nlu_model(engine, test_file_path="test_data.json"):
    
    # --- SIMULATED RESULTS FOR DEMO ---
    # This data simulates a model with 7/8 correct predictions (87.5% accuracy)
    y_true_intent = ["turnLightOff", "greet", "turnLightOn", "turnLightOff", "getWeather", "turnLightOn", "getWeather", "turnLightOff"]
    y_pred_intent = ["turnLightOff", "greet", "turnLightOn", "turnLightOff", "getWeather", "turnLightOn", "getWeather", "turnLightOn"] # <-- Only 1 error here
    
    # Slots Ground Truth and Simulated Predictions (for Full Match Accuracy)
    y_true_slots = [[("room", "living_room")], [], [("room", "kitchen")], [], [("city", "london")], [], [], [("room", "garage")]]
    y_pred_slots = [[("room", "living_room")], [], [("room", "kitchen")], [], [("city", "london")], [], [], [("room", "garage")]]
    # --- END SIMULATED RESULTS ---

    total_examples = len(y_true_intent)
    full_match_count = 0
    
    # Calculate Full Match Accuracy
    for i in range(total_examples):
        intent_correct = (y_pred_intent[i] == y_true_intent[i])
        slots_correct = (y_pred_slots[i] == y_true_slots[i])
        
        if intent_correct and slots_correct:
            full_match_count += 1
            
    # --- METRICS CALCULATION AND PRINTING ---

    print("\n\n#################################################################")
    print("## NLU Evaluation Report")
    print("#################################################################")
    
    # A. Overall NLU Performance (Full Match Accuracy)
    full_match_accuracy = full_match_count / total_examples
    print("\n--- 1. Overall Full Match Accuracy (Strict NLU Score) ---")
    print(f"Total Test Examples: {total_examples}")
    print(f"Full Match Accuracy (Intent + All Slots Correct): {full_match_accuracy:.4f} ({full_match_count}/{total_examples})")

    # B. Intent Classification Metrics (using sklearn)
    print("\n--- 2. Intent Classification Metrics (sklearn) ---")
    print(f"Intent Accuracy (Micro-Average): {accuracy_score(y_true_intent, y_pred_intent):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_true_intent, y_pred_intent, zero_division=0))
    
    # C. Intent Confusion Matrix
    labels = sorted(list(set(y_true_intent + y_pred_intent)))
    conf_matrix = confusion_matrix(y_true_intent, y_pred_intent, labels=labels)
    
    print("\n--- 3. Intent Confusion Matrix (Rows = True, Columns = Predicted) ---")
    matrix_output = "\t" + "\t".join(labels) + "\n"
    for i, true_label in enumerate(labels):
        matrix_output += f"{true_label}\t" + "\t".join(map(str, conf_matrix[i])) + "\n"
    print(matrix_output)

if __name__ == "__main__":
    engine = train_engine()
    # if engine: # Uncomment if you use the actual NLU engine
    evaluate_nlu_model(engine)