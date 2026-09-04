#!/usr/bin/env bash

# ================================================================
#          BIS Sahayak - AI Assistant for Indian Standards
#               Smart India Hackathon (SIH PS26107)
# ================================================================

echo "================================================================"
echo "         BIS Sahayak - AI Assistant for Indian Standards        "
echo "              Smart India Hackathon (SIH PS26107)               "
echo "================================================================"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js is not installed!"
    echo "Please install Node.js (v18+) from: https://nodejs.org/"
    exit 1
fi

# 2. Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ [ERROR] npm is not found in PATH!"
    exit 1
fi

echo "✅ [OK] Node.js $(node -v) and npm $(npm -v) detected."
echo ""

# 3. Setup .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "ℹ️  [INFO] Creating .env file from .env.example..."
        cp .env.example .env
    else
        echo "GEMINI_API_KEY=" > .env
    fi
fi

# 4. Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo "ℹ️  [INFO] Installing dependencies (first-time setup)..."
    npm install
fi

# 5. Open browser in background
if command -v xdg-open &> /dev/null; then
    (sleep 3 && xdg-open http://localhost:3000) &
elif command -v open &> /dev/null; then
    (sleep 3 && open http://localhost:3000) &
fi

echo ""
echo "================================================================"
echo "  🚀 Starting Server at http://localhost:3000 (Ctrl+C to stop)  "
echo "================================================================"
echo ""

npm run dev
