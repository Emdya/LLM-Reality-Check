#  LLM RealityCheck

A Chrome Extension + FastAPI backend for identifying and labeling AI-generated hallucinations in LLM responses.

---

## 🛠️ Step-by-Step Installation Guide (Developer Setup)

You can follow these instructions to get the backend up and running locally.

---

### Prerequisites

Make sure you have the following installed:

- **Python 3.10+**
- **Git**
- **Visual Studio Code** (or your preferred IDE)
- **Uvicorn** (automatically installed via requirements)

---

###  Installation Steps

#### **1. Create a Python Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```
#### **2. Clone the Repository**
```bash
git clone https://github.com/Emdya/LLM-Reality-Check.git
```
#### **3. Navigate to the Project Directory**
```bash
cd LLM-Reality Check
```
#### **4. Open the Project in VS Code**
```bash
code .
```
#### **5. Install Backend Requirements**
```bash
pip install -r backend/requirements.txt
```
#### **6. Launch the FastAPI Server**
```bash
uvicorn main:app --reload
```
#### **7. Access the API Docs**
Once the server is running, you'll see a message like:
```arduino
INFO:     Uvicorn running on http://127.0.0.1:8000
```
Open your browser and visit:
```arduino
http://127.0.0.1:8000/docs
```
to interact with the API via the Swagger UI


