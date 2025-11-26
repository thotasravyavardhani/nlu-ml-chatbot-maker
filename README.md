# 🤖 NLU ML Chatbot Platform
>>>>>>> 363640e (Complete NLU ML Platform with all features)

A comprehensive platform for building, training, and deploying intelligent **Natural Language Understanding (NLU)** chatbots powered by advanced **Machine Learning** algorithms and **RASA** framework.

![Platform Banner](https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-professional-nlu-ml-platform-dash-3441cf8f-20251110175143.jpg)

---

## 🌟 Features

### 🔐 **Authentication & User Management**
- Secure JWT-based authentication with better-auth
- User registration and login
- Protected routes and middleware
- Session management

### 📁 **Workspace Management**
- Create and manage multiple workspaces
- Organize projects and datasets efficiently
- Workspace-specific settings and configurations

### 📊 **Dataset Management**
- Upload CSV, JSON, and YML datasets
- Interactive data preview and visualization
- Column selection for training
- Download and export capabilities

### 🧠 **Machine Learning Training**
- **6 ML Algorithms**: Random Forest, SVM, Logistic Regression, Decision Tree, KNN, XGBoost
- Automatic best model selection based on accuracy
- Parallel algorithm training
- Model comparison and evaluation

### 📈 **Model Evaluation**
- Comprehensive metrics: Accuracy, Precision, Recall, F1-Score
- Confusion matrix visualization
- Performance graphs and charts
- Training history tracking

### 💬 **RASA-Powered NLU Chatbot**
- Natural Language Understanding with RASA
- Intent recognition and entity extraction
- Interactive chat interface
- Real-time training and testing

### 🔄 **Model Management**
- Export trained models (`.pickle`, `.h5` formats)
- Model retraining capabilities
- Model versioning and history
- Metadata tracking

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Shadcn/UI** - Beautiful UI components
- **Lucide Icons** - Icon library
- **React Hook Form** - Form management
- **Recharts** - Data visualization

### **Backend**
- **Next.js API Routes** - RESTful API endpoints
- **Drizzle ORM** - Database management
- **Turso (SQLite)** - Serverless database
- **Python Flask** - ML/RASA backend server
- **better-auth** - Authentication system

### **Machine Learning & NLU**
- **Scikit-learn** - ML algorithms implementation
- **RASA** - NLU framework
- **XGBoost** - Gradient boosting
- **Pandas/NumPy** - Data processing
- **Joblib** - Model serialization

---

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher)
- **Bun** (recommended) or npm/yarn/pnpm
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Git**

---

## 🚀 Installation

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/thotasravyavardhani/ECommerceChatbot.git
cd ECommerceChatbot
```

### 2️⃣ **Install Frontend Dependencies**

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3️⃣ **Install Python Backend Dependencies**

```bash
cd python-backend
pip install -r requirements.txt
cd ..
```

### 4️⃣ **Set Up Environment Variables**

Create a `.env` file in the root directory:

```env
# Database
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 926b1e3 (Sync codebase)
=======
# Python Backend
PYTHON_BACKEND_URL=http://localhost:5000
```

### 5️⃣ **Database Setup**

```bash
# Generate database migrations
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Seed database with sample data
bun run db:seed
```

---

## ▶️ Running the Application

### **Option 1: Start All Services (Recommended)**

#### **Windows:**
```bash
start-all.bat
```

#### **Linux/Mac:**
```bash
chmod +x start-all.sh
./start-all.sh
```

### **Option 2: Start Services Individually**

#### **Terminal 1 - Frontend (Next.js):**
```bash
bun run dev
# Or: npm run dev
```

#### **Terminal 2 - Python Backend:**
```bash
cd python-backend
python app.py
```

#### **Terminal 3 - RASA Server (Optional):**
```bash
cd python-backend
rasa run --enable-api --cors "*" --port 5005
```

---

## 🌐 Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Python Backend API:** [http://localhost:5000](http://localhost:5000)
- **RASA Server:** [http://localhost:5005](http://localhost:5005)

---

## 📖 Usage Guide

### **1. Create an Account**
1. Navigate to the homepage
2. Click "Get Started" or "Register"
3. Fill in your details and create an account

### **2. Create a Workspace**
1. After login, go to the Dashboard
2. Click "Create New Workspace"
3. Enter workspace name and description

### **3. Upload Dataset**
1. Enter your workspace
2. Navigate to "Dataset Upload" in the sidebar
3. Upload your CSV/JSON/YML file
4. Preview and select target column

### **4. Train ML Models**
1. Go to "Train Models" section
2. Select your dataset
3. Choose target column
4. Click "Train Models" (trains all 6 algorithms)
5. Wait for training to complete

### **5. Evaluate Models**
1. Navigate to "Model Evaluation"
2. View accuracy, precision, recall, F1-score
3. Analyze confusion matrix and performance graphs
4. System automatically selects the best model

### **6. Test Your Chatbot**
1. Go to "NLU Chatbot" section
2. Train RASA model with your data
3. Test conversations in real-time
4. Refine and retrain as needed

### **7. Export Models**
1. Navigate to "Model Info"
2. Download trained model as `.pickle` or `.h5`
3. Use in production or retrain later

---

## 📁 Project Structure

```
ECommerceChatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── workspace/[id]/    # Workspace detail page
│   │   ├── login/             # Authentication pages
│   │   └── register/
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   └── workspace/        # Workspace components
│   ├── db/                    # Database schema & migrations
│   ├── lib/                   # Utilities & auth config
│   └── hooks/                 # Custom React hooks
│
├── python-backend/            # Python Flask server
│   ├── services/             # ML & RASA services
│   ├── models/               # Trained model storage
│   ├── datasets/             # Dataset storage
│   └── app.py                # Flask application
│
├── public/                    # Static assets
│   └── sample-datasets/      # Example datasets
│
├── drizzle/                   # Database migrations
├── .env                       # Environment variables
├── start-all.bat             # Windows startup script
├── start-all.sh              # Linux/Mac startup script
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user

### **Workspaces**
- `GET /api/workspaces` - List all workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `DELETE /api/workspaces/[id]` - Delete workspace

### **Datasets**
- `POST /api/datasets/upload` - Upload dataset
- `GET /api/datasets/[id]` - Get dataset details
- `POST /api/python/datasets/preview` - Preview dataset

### **ML Training**
- `POST /api/python/ml/train` - Train ML models
- `POST /api/python/ml/predict` - Make predictions
- `POST /api/python/ml/retrain` - Retrain model
- `GET /api/python/models/metadata` - Get model metadata
- `GET /api/python/models/export` - Export model

### **RASA/NLU**
- `POST /api/python/rasa/train` - Train RASA model
- `POST /api/python/rasa/predict` - NLU prediction
- `POST /api/python/rasa/chat` - Chat with bot

---

## 🧪 Sample Datasets

Sample datasets are available in `/public/sample-datasets/` for testing:
- Customer support conversations
- E-commerce product queries
- Intent classification data

---

## 🐛 Troubleshooting

### **Python Backend Not Starting**
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Install missing dependencies
cd python-backend
pip install -r requirements.txt
```

### **Database Connection Error**
- Verify `.env` file contains correct Turso credentials
- Run `bun run db:push` to sync schema

### **RASA Training Fails**
- Ensure RASA is properly installed: `pip install rasa`
- Check Python version compatibility (3.8-3.10 recommended)

---

## 📝 Documentation

Additional documentation available:
- [Quick Start Guide](QUICK_START_PYTHON_BACKEND.md)
- [Python Backend Setup](PYTHON_BACKEND_SETUP.md)
- [Integration Guide](INTEGRATION_COMPLETE.md)
- [Feature Documentation](FEATURES.md)
- [Windows Setup Guide](WINDOWS_SETUP.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Sravya Vardhani Thota** - [@thotasravyavardhani](https://github.com/thotasravyavardhani)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [RASA](https://rasa.com/) - NLU framework
- [Scikit-learn](https://scikit-learn.org/) - ML library
- [Shadcn/UI](https://ui.shadcn.com/) - UI components
- [Turso](https://turso.tech/) - Database platform
- [better-auth](https://www.better-auth.com/) - Authentication

---

## 📞 Support

For support, email your-email@example.com or open an issue in this repository.

---

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced intent annotation tools
- [ ] Team collaboration features
- [ ] Real-time model monitoring
- [ ] API key management for external integrations
- [ ] Deployment automation
- [ ] Model versioning and A/B testing

---

**⭐ If you find this project useful, please consider giving it a star!**
>>>>>>> 363640e (Complete NLU ML Platform with all features)

