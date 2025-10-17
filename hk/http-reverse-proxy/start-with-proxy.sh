#!/bin/bash

# HK MCP Server with Reverse Proxy Startup Script
# This script starts the proxy server and the MCP server

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "  HK MCP Server with Reverse Proxy"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your credentials:"
    echo "  AUTH_USERNAME=your_username"
    echo "  AUTH_PASSWORD=your_password"
    exit 1
fi

# Source .env to check credentials
source .env

if [ -z "$AUTH_USERNAME" ] || [ -z "$AUTH_PASSWORD" ]; then
    echo "❌ Error: AUTH_USERNAME and AUTH_PASSWORD must be set in .env file"
    exit 1
fi

if [ "$AUTH_USERNAME" = "your_username_here" ] || [ "$AUTH_PASSWORD" = "your_password_here" ]; then
    echo "❌ Error: Please update .env file with your actual credentials"
    echo "Current values are still placeholder values."
    exit 1
fi

echo "✓ Environment variables loaded"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Kill any existing proxy server on the same port
PROXY_PORT=${PROXY_PORT:-3000}
if lsof -Pi :$PROXY_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PROXY_PORT is already in use. Killing existing process..."
    kill $(lsof -t -i:$PROXY_PORT) 2>/dev/null || true
    sleep 1
fi

# Start the proxy server in background
echo "🚀 Starting reverse proxy server on port $PROXY_PORT..."
node proxy-server.js > proxy.log 2>&1 &
PROXY_PID=$!
echo "✓ Proxy server started (PID: $PROXY_PID)"
echo ""

# Wait for proxy to be ready
echo "⏳ Waiting for proxy server to be ready..."
for i in {1..10}; do
    if curl -s http://localhost:$PROXY_PORT >/dev/null 2>&1; then
        echo "✓ Proxy server is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Proxy server failed to start. Check proxy.log for details."
        cat proxy.log
        kill $PROXY_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done
echo ""

# Start the MCP server
echo "🚀 Starting MCP server..."
echo "   API Name: hk"
echo "   Proxy URL: http://localhost:$PROXY_PORT"
echo "   Spec Path: /workspace/hk-openapi.yaml"
echo ""
echo "=================================================="
echo "  Both servers are running!"
echo "=================================================="
echo ""
echo "Proxy Server: http://localhost:$PROXY_PORT"
echo "Proxy Log: tail -f $SCRIPT_DIR/proxy.log"
echo ""
echo "To stop the proxy server: kill $PROXY_PID"
echo ""

# Start MCP server (this will run in foreground)
awslabs.openapi-mcp-server \
  --api-name hk \
  --api-url http://localhost:$PROXY_PORT \
  --spec-path /workspace/hk-openapi.yaml

# Cleanup on exit
echo ""
echo "⚠️  Shutting down proxy server..."
kill $PROXY_PID 2>/dev/null || true
echo "✓ Cleanup complete"
