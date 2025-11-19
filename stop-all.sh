#!/bin/bash

# NLU ML Platform - Stop All Services Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🛑 NLU ML Platform - Stop All Services 🛑         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Stop Python Backend
echo -e "${BLUE}🐍 Stopping Python ML Backend...${NC}"
cd python-backend

if [ -f "docker-compose.yml" ]; then
    docker-compose down
    echo -e "${GREEN}✅ Python backend stopped${NC}"
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
fi

cd ..

echo ""

# Stop Next.js Frontend
echo -e "${BLUE}⚛️  Stopping Next.js Frontend...${NC}"

# Find and kill processes on port 3000
if lsof -i :3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}🔍 Found process on port 3000, killing...${NC}"
    lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Next.js frontend stopped${NC}"
else
    echo -e "${GREEN}✅ No process running on port 3000${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo ""
echo -e "${YELLOW}To start again, run:${NC} ${BLUE}npm run start:all${NC}"
echo ""
