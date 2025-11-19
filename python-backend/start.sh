#!/bin/bash

echo "🚀 Starting NLU ML Platform Python Backend Services..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
mkdir -p models
mkdir -p rasa_projects

echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check ML Service health
echo "🔍 Checking ML Service (port 8000)..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ ML Service is running at http://localhost:8000"
else
    echo "⚠️  ML Service health check failed"
fi

# Check Rasa Service health
echo "🔍 Checking Rasa NLU Service (port 8001)..."
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Rasa NLU Service is running at http://localhost:8001"
else
    echo "⚠️  Rasa NLU Service health check failed"
fi

echo ""
echo "🎉 Backend services are ready!"
echo ""
echo "📊 ML Service: http://localhost:8000"
echo "🤖 Rasa Service: http://localhost:8001"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
