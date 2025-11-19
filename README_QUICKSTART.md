# 🚀 Quick Start - NLU ML Platform

## One Command to Start Everything

```bash
npm run start:all
```

This single command will:
- ✅ Start Python ML Backend (Docker on ports 8000 & 8001)
- ✅ Start Next.js Frontend (port 3000)
- ✅ Run health checks on all services

---

## Alternative: Manual Start

### 1️⃣ Start Python Backend

```bash
cd python-backend
./start.sh
```

This runs `app.py` inside Docker containers for ML Service (port 8000) and Rasa NLU (port 8001).

### 2️⃣ Start Next.js Frontend (New Terminal)

```bash
npm run dev
```

This starts the Next.js development server on port 3000.

---

## Stop All Services

```bash
npm run stop:all
```

---

## Available NPM Commands

| Command | Description |
|---------|-------------|
| `npm run start:all` | Start both Python backend and Next.js frontend |
| `npm run stop:all` | Stop all services |
| `npm run dev` | Start Next.js only |
| `npm run start:backend` | Start Python backend only |
| `npm run stop:backend` | Stop Python backend only |
| `npm run logs:backend` | View Python backend logs |
| `npm run restart:backend` | Restart Python backend |

---

## Verify Everything Works

1. **Python ML Service**: http://localhost:8000/health
2. **Rasa NLU Service**: http://localhost:8001/health  
3. **Next.js Frontend**: http://localhost:3000

---

## First Time Setup

If this is your first time:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Start everything
npm run start:all

# 4. Open browser
# Go to http://localhost:3000
```

---

## What Each Service Does

### 🐍 Python ML Backend (`app.py`)
- **Port 8000 (ML Service)**: Trains models with 6+ ML algorithms (Random Forest, SVM, XGBoost, etc.)
- **Port 8001 (Rasa NLU)**: Handles NLU chatbot training and parsing
- **How it runs**: Docker containers via `python-backend/start.sh`

### ⚛️ Next.js Frontend (`npm run dev`)
- **Port 3000**: Web interface for the entire platform
- **Features**: Workspace management, dataset upload, model training UI, chatbot interface

---

## Troubleshooting

### ❌ "Port already in use"

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### ❌ "Docker not running"

Make sure Docker Desktop is running, then:

```bash
npm run start:backend
```

### ❌ Training shows "Simulation Mode"

Backend is not connected. Start it with:

```bash
cd python-backend
./start.sh
```

Wait 10 seconds, then refresh the frontend.

---

## 📚 Full Documentation

- **Complete Guide**: See [START_GUIDE.md](./START_GUIDE.md)
- **Features**: See [FEATURES.md](./FEATURES.md)
- **Python Backend**: See [python-backend/README.md](./python-backend/README.md)

---

**Ready to build intelligent chatbots! 🤖**
