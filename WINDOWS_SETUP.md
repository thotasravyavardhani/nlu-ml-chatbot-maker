# 🪟 Windows Setup Guide - NLU ML Platform

## Prerequisites

Before running the application, make sure you have:

1. ✅ **Docker Desktop** installed and running
2. ✅ **Node.js** (v18 or higher)
3. ✅ **npm** (comes with Node.js)

---

## 🚀 Quick Start (Windows)

### **One Command to Start Everything:**

```cmd
npm run start:all
```

This will:
1. Start Python ML Backend (Docker containers)
2. Start Next.js Frontend (port 3000)

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run start:all` | **Start everything** (Python backend + Next.js) |
| `npm run stop:all` | **Stop everything** |
| `npm run dev` | Start Next.js only (port 3000) |
| `npm run start:backend` | Start Python backend only |
| `npm run stop:backend` | Stop Python backend |
| `npm run logs:backend` | View Python backend logs |
| `npm run restart:backend` | Restart Python backend |

---

## 🐳 Manual Start (Alternative)

If you prefer to start services manually:

### 1. Start Python Backend:
```cmd
cd python-backend
docker-compose up -d
cd ..
```

### 2. Start Next.js Frontend:
```cmd
npm run dev
```

---

## 🎯 Service URLs

- **🐍 Python ML Service**: http://localhost:8000
- **🤖 Rasa NLU Service**: http://localhost:8001
- **⚛️ Next.js Frontend**: http://localhost:3000

---

## 🛠️ Troubleshooting

### Issue: "Docker is not running"
**Solution**: 
1. Open Docker Desktop
2. Wait until Docker is fully started
3. Run `npm run start:all` again

### Issue: Port 3000 already in use
**Solution**:
```cmd
npm run stop:all
```
Or manually kill the process:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Backend services not starting
**Solution**:
```cmd
cd python-backend
docker-compose down
docker-compose up -d --force-recreate
cd ..
```

### Issue: Can't connect to backend
**Solution**:
1. Check if Docker containers are running:
   ```cmd
   cd python-backend
   docker-compose ps
   ```
2. View logs for errors:
   ```cmd
   npm run logs:backend
   ```

---

## 🔄 Stopping Services

To stop all services:
```cmd
npm run stop:all
```

Or manually:
```cmd
cd python-backend
docker-compose down
cd ..
```

---

## 📝 Notes

- The frontend will automatically detect when Python backend is ready
- First startup may take 2-3 minutes while Docker builds containers
- Make sure ports 3000, 8000, and 8001 are not in use by other applications

---

## ✅ Ready!

Once all services are running, open your browser to:
**http://localhost:3000**

🎉 Your NLU ML Platform is ready to use!
