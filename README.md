# INFOSYS VIRTUAL INTERNSHIP - 6.0

## MAIN Branch - ASSIGNMENTS
## MASTER Branch - FINAL PROJECT


# 🎓 Infosys Virtual Internship - NLU & ML Track (Assignments)

This repository contains the complete submission of assessments and milestones for the **Infosys Springboard Virtual Internship 6.0**. The project focuses on Natural Language Understanding (NLU), Machine Learning (ML), and Chatbot development using various frameworks.

## 📂 Repository Structure & Assessments

### **Assessment 1: Data Handling (CSV)**
* **Focus:** Basic data ingestion and processing.
* **Files:** `Students.csv`
* **Description:** Initial setup and handling of structured CSV data for chatbot input processing.

### **Assessment 2: Unstructured Data Processing**
* **Focus:** Handling unstructured documents using APIs.
* **Tools:** Unstructured.io API, Python.
* **Key Files:** * `procedure.txt`: Documentation on API key generation and ingestion commands.
    * `Medical_Chatbot_Input/`: Raw .docx files.
    * `Medical_Chatbot_Output/`: Structured JSON output.
* **Description:** Utilized the Unstructured API to partition and process raw medical documents into clean JSON format for NLU consumption.

### **Assessment 4: RASA NLU Development**
* **Focus:** Building a custom NLU chatbot locally using the RASA framework.
* **Tools:** RASA Open Source, Python (Action Server).
* **Key Files:** * `domain.yml`, `nlu.yml`, `stories.yml`: RASA configuration files.
    * `actions/actions.py`: Custom Python actions for symptom checking and medication queries.
    * `procedure.txt`: Guide for running the Action Server (`rasa run actions`) and Shell (`rasa shell`).
* **Capabilities:** * **High-Risk Triage:** Detects severe symptoms (e.g., chest pain) and alerts for emergency.
    * **Moderate-Risk Triage:** Advises rest for common ailments (e.g., headache, fever).

### **Assessment 6: Google DialogFlow Integration**
* **Focus:** Cloud-based NLU integration.
* **Tools:** Google DialogFlow ES/CX, HTML.
* **Key Files:** `E-ShopBot.html`, `procedure.txt`.
* **Description:** Integration of a DialogFlow agent ("Online-Shopping") into a web interface using the `df-messenger` component.

### **Assessment 7: SNIPS NLU Chatbot**
* **Focus:** Offline/Embedded NLU engine implementation.
* **Tools:** Snips NLU, Python.
* **Key Files:**
    * `chatbot_app.py`: Main interactive chat script with context management.
    * `dataset.json`: Training dataset.
    * `documentation.txt`: Setup guide for symbolic links and environment activation.
* **Description:** A Python-based chatbot capable of intent parsing (`turnLightOn`, `turnLightOff`, `greet`) with slot filling (Room detection) and context-aware responses.

### **Assessment 8: Botpress NLU**
* **Focus:** Visual Flow-based Chatbot Builders.
* **Tools:** Botpress Cloud.
* **Key Files:** `qumail.html` (Webchat integration), `procedure.txt` (Studio links).
* **Description:** Created a workflow-driven chatbot using Botpress Studio and deployed it via a shareable webchat interface.

### **Assessment 9: NLU Evaluation Tool**
* **Focus:** Metrics and Performance Evaluation of NLU models.
* **Tools:** Scikit-learn, Seqeval, Snips NLU.
* **Key Files:** `evaluate_nlu.py`, `dataset.json`, `test_data.json`.
* **Description:** A comprehensive Python evaluation script that calculates:
    * **Full Match Accuracy:** Strict correctness (Intent + Slots).
    * **Classification Report:** Precision, Recall, and F1-Scores for intents.
    * **Confusion Matrix:** Visualizing misclassified intents.

---
**Author:** Sravya Vardhani Thota
