from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# --- 1. SYMPTOM CHECKER ACTION (Triage Logic) ---

class ActionSymptomChecker(Action):
    """Performs a risk assessment based on the reported symptom entity."""
    
    def name(self) -> Text:
        # This name must be used in domain.yml and stories.yml
        return "action_symptom_checker"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # 1. Get the symptom entity from the latest user message
        # We use next() with a default of None to handle cases where extraction fails.
        symptom = next(tracker.get_latest_entity_values("symptom"), "general discomfort")
        
        # 2. Simplified Risk Assessment Logic
        if "chest pain" in symptom or "shortness of breath" in symptom or "severe pain" in symptom:
            risk_level = "HIGH"
            response_text = f"🚨 **Immediate Attention Required!** Based on your report of {symptom}, please seek emergency medical attention or call emergency services right away."
        elif "fever" in symptom or "headache" in symptom or "sore throat" in symptom:
            risk_level = "MODERATE"
            response_text = f"🤒 Your symptoms ({symptom}) suggest a common ailment. I recommend resting and monitoring your temperature. Consult a doctor if symptoms worsen."
        else:
            risk_level = "LOW"
            response_text = "✅ Your symptoms are mild. Try drinking fluids and resting. If you are still concerned, you can book an appointment."

        # 3. Send the message and set the slot
        dispatcher.utter_message(text=response_text)
        
        # 4. Return the event to set the slot (optional, but good practice)
        return [SlotSet("risk_level", risk_level)]


# --- 2. MEDICATION QUERY ACTION (KeyError Fix) ---

class ActionMedicationQuery(Action):
    """Handles medication dosage and information queries safely."""

    def name(self) -> Text:
        # This name must be used in domain.yml and stories.yml
        return "action_medication_query"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get the 'medication' entity/slot value. 
        # Using get_latest_entity_values ensures we catch the entity even if it's not a slot.
        medication = next(tracker.get_latest_entity_values("medication"), None)
        
        if medication:
            # If medication is found, use it in the safe template
            response_text = f"I can provide general information about **{medication}**, but please consult a professional for personalized dosage advice."
        else:
            # If medication is NOT found, ask the user to clarify (graceful fallback)
            response_text = "I didn't quite catch the medication name. Could you please specify which one you are asking about so I can search for general information?"

        dispatcher.utter_message(text=response_text)
            
        # We clear the slot so the next question is handled fresh.
        return [SlotSet("medication", None)]
