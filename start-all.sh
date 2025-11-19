#!/bin/bash

# NLU ML Platform - Master Startup Script
# This script starts both Python ML Backend and Next.js Frontend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🚀 NLU ML Platform - Complete Startup 🚀          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
echo ""

# Check Docker
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}   Please install Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check Docker Compose
if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}   Please install Docker Compose${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose installed${NC}"

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}   Please install Node.js: https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js installed ($(node -v))${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm installed ($(npm -v))${NC}"

echo ""

# Check if ports are available
echo -e "${BLUE}🔍 Checking ports...${NC}"
echo ""

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use (Next.js)${NC}"
    echo -e "${YELLOW}   Kill existing process: lsof -i :3000 | grep LISTEN | awk '{print \$2}' | xargs kill -9${NC}"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Port 3000 available (Next.js Frontend)${NC}"
fi

if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use (ML Service)${NC}"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Port 8000 available (ML Service)${NC}"
fi

if port_in_use 8001; then
    echo -e "${YELLOW}⚠️  Port 8001 is already in use (Rasa Service)${NC}"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Port 8001 available (Rasa NLU Service)${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Start Python ML Backend
echo -e "${BLUE}🐍 Starting Python ML Backend...${NC}"
echo ""

cd python-backend

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found in python-backend/${NC}"
    exit 1
fi

# Build and start Docker containers
echo -e "${YELLOW}📦 Building Docker images (this may take a few minutes on first run)...${NC}"
docker-compose build --quiet

echo -e "${YELLOW}🔄 Starting Docker containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 8

# Health check for ML Service
echo -n "🔍 Checking ML Service (port 8000)... "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    echo -e "${YELLOW}   Check logs: cd python-backend && docker-compose logs ml-service${NC}"
fi

# Health check for Rasa Service
echo -n "🔍 Checking Rasa Service (port 8001)... "
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    echo -e "${YELLOW}   Check logs: cd python-backend && docker-compose logs rasa-service${NC}"
fi

cd ..

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Start Next.js Frontend
echo -e "${BLUE}⚛️  Starting Next.js Frontend...${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies (first time setup)...${NC}"
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}📝 Copying .env.example to .env${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please configure your .env file with database credentials${NC}"
    fi
fi

echo -e "${YELLOW}🚀 Starting Next.js development server...${NC}"
echo ""

# Start Next.js in the background (optional, or just run it)
npm run dev &
NEXTJS_PID=$!

# Wait a bit for Next.js to start
sleep 5

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Display success message
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Service Status                          ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} ${GREEN}✅ Next.js Frontend${NC}     http://localhost:3000           ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${GREEN}✅ Python ML Service${NC}    http://localhost:8000           ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${GREEN}✅ Rasa NLU Service${NC}     http://localhost:8001           ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo -e "   ${BLUE}View Backend Logs:${NC}  cd python-backend && docker-compose logs -f"
echo -e "   ${BLUE}Stop All Services:${NC}  npm run stop:all"
echo -e "   ${BLUE}Restart Backend:${NC}    cd python-backend && docker-compose restart"
echo ""

echo -e "${CYAN}🎓 Next Steps:${NC}"
echo -e "   1. Open ${GREEN}http://localhost:3000${NC} in your browser"
echo -e "   2. Register a new account or sign in"
echo -e "   3. Create a workspace"
echo -e "   4. Upload a dataset and start training!"
echo ""

echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running (Next.js is running in foreground)
wait $NEXTJS_PID
