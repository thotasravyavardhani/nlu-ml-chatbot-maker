import io
import json
import random
from snips_nlu import SnipsNLUEngine
from snips_nlu.default_configs import CONFIG_EN

# --- Global Session/Memory (The 'Context') ---
# This dictionary stores temporary conversation data for the user.
SESSION_CONTEXT = {
    "last_room": None,
    "user_name": "Valued User" # Default name
}

# --- 1. NLU ENGINE SETUP AND TRAINING (Same as before) ---
def train_engine():
    """Loads the dataset.json and trains the NLU engine."""
    try:
        with io.open("dataset.json", encoding="utf8") as f:
            custom_dataset = json.load(f)
        
        print("Starting NLU Engine training...")
        # Suppress the DeprecationWarning for a cleaner output
        import warnings
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=DeprecationWarning)
            
            nlu_engine = SnipsNLUEngine(config=CONFIG_EN)
            nlu_engine = nlu_engine.fit(custom_dataset)
        
        print("Training complete. Assistant is online.")
        return nlu_engine
    except FileNotFoundError:
        print("FATAL ERROR: 'dataset.json' not found. Did you run 'snips-nlu generate-dataset'?")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during training: {e}")
        return None

# --- 2. ADVANCED DIALOGUE MANAGEMENT ---
def get_bot_response(parsing_result):
    """Processes the NLU output, manages context, and returns a creative response."""
    
    intent_name = parsing_result.get('intent', {}).get('intentName')
    slots = parsing_result.get('slots', [])
    
    # Helper to find a specific slot's resolved value
    def find_slot(slot_name):
        return next((s['value']['value'] for s in slots if s['slotName'] == slot_name), None)

    # --- NLU Action: Extract new room from current input ---
    new_room = find_slot('room')
    
    # --- Intent Handling Logic with Context ---
    
    if intent_name == 'turnLightOn' or intent_name == 'turnLightOff':
        
        # 1. Determine the target room: use new_room if provided, otherwise use the last known room
        target_room = new_room if new_room else SESSION_CONTEXT['last_room']
        
        action = "ON" if intent_name == 'turnLightOn' else "OFF"
        
        if target_room:
            # 2. Fulfill the command
            
            # Update context for the next turn
            SESSION_CONTEXT['last_room'] = target_room 
            
            # Creative Responses
            responses = [
                f"Roger that, {SESSION_CONTEXT['user_name']}. Command executed: lights {action} in the **{target_room}**.",
                f"Confirmed. The lighting is now set to {action} in the **{target_room}**.",
                f"Consider it done. **{target_room}** illumination set to {action}."
            ]
            return random.choice(responses)
        
        else:
            # 3. Missing slot: Prompt the user creatively
            return random.choice([
                "I hear the intent, but which room needs attention?",
                "Could you specify the room? My internal map is feeling fuzzy.",
                "Room parameter missing. Which space should I target?"
            ])

    elif intent_name == 'greet':
        # Introduce a creative variant
        greetings = [
            f"Hello, {SESSION_CONTEXT['user_name']}! Your home assistant is ready.",
            "Greetings! I am active and awaiting your command.",
            "A fine day! What can I control for you today?"
        ]
        return random.choice(greetings)

    # --- Fallback/Error Handling ---
    elif intent_name is None:
        return random.choice([
            "My apologies, that command is outside my current programming. Try a light or temperature command.",
            "I seem to be having trouble processing that. Can you rephrase?",
            "Unrecognized query. I'm limited to smart home functions for now."
        ])
        
    else:
        # Catch-all
        return f"I recognized the intent '{intent_name}', but my response module for that is still in beta."


# --- 3. THE INTERACTIVE LOOP ---
if __name__ == "__main__":
    
    engine = train_engine()
    
    if engine:
        print("\n--- START ADVANCED CHAT ---")
        print(f"Bot: Hello! What is your name? (Type 'skip' to use the default)")
        
        # Get user name at start for a personal touch
        name_input = input("You: ")
        if name_input.lower() not in ["skip", "quit", "exit"]:
             # Simple extraction of the first word as a name
             SESSION_CONTEXT['user_name'] = name_input.split()[0]
             print(f"Bot: Pleasure to meet you, {SESSION_CONTEXT['user_name']}! Let's get started.")
        else:
             print(f"Bot: Alright. Type 'quit' or 'exit' anytime to stop.")

        
        # Main conversation loop
        while True:
            try:
                user_input = input(f"\n{SESSION_CONTEXT['user_name']}: ")
            except EOFError:
                break

            if user_input.lower() in ["quit", "exit", "stop"]:
                print("Bot: Shutting down systems. Goodbye!")
                break
                
            # Parse the input
            parsing_result = engine.parse(user_input)
            
            # Get the response
            response = get_bot_response(parsing_result)
            
            # Print the response
            print(f"Assistant: {response}")