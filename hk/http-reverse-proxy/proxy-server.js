import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'BACKEND_URL';
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

// Validate required environment variables
if (!AUTH_USERNAME || !AUTH_PASSWORD) {
  console.error('ERROR: AUTH_USERNAME and AUTH_PASSWORD must be set in .env file');
  process.exit(1);
}

// Create Basic Auth header
const authHeader = 'Basic ' + Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');

// Proxy configuration
const proxyOptions = {
  target: BACKEND_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Add Basic Authentication header to all outgoing requests
    proxyReq.setHeader('Authorization', authHeader);

    // Log the request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log the response
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} <- ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[${new Date().toISOString()}] Proxy error:`, err.message);
    res.status(500).json({
      error: 'Proxy error',
      message: err.message
    });
  },
  // Preserve the host header from the request
  preserveHostHdr: false,
  // Handle SSL/TLS
  secure: true,
  // Follow redirects
  followRedirects: true
};

// Create the proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Apply proxy to all routes
app.use('/', proxy);

// Start the server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Reverse Proxy Server Started');
  console.log('='.repeat(60));
  console.log(`📍 Proxy listening on: http://localhost:${PORT}`);
  console.log(`🎯 Backend target: ${BACKEND_URL}`);
  console.log(`🔐 Authentication: Basic Auth (username: ${AUTH_USERNAME})`);
  console.log('='.repeat(60));
  console.log('Ready to accept requests from MCP server...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
