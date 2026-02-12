#!/bin/bash

# Build script for Manus deployment
set -e

echo "🔨 Building Eiken Exam System..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "from backend import init_db; init_db()"
python3 seed.py

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
