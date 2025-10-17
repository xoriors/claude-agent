# HK MCP Server with Reverse Proxy

This setup provides a reverse proxy with Basic Authentication for the HK OpenAPI MCP Server.

## Architecture

```
MCP Server → Reverse Proxy (localhost:3000) → Backend API (with Basic Auth)
```

The reverse proxy:
- Listens on `http://localhost:3000`
- Adds Basic Authentication headers to all requests
- Forwards requests to BACKEND_URL

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Credentials

Edit the `.env` file and add your credentials:

```bash
# .env
BACKEND_URL=BACKEND_URLD
AUTH_USERNAME=your_actual_username
AUTH_PASSWORD=your_actual_password
PROXY_PORT=3000
```

**Important:** Replace `your_actual_username` and `your_actual_password` with your real credentials.

### 3. Start Everything

**Option A: Use the startup script (recommended)**

```bash
./start-with-proxy.sh
```

This will:
1. Start the reverse proxy server on port 3000
2. Start the MCP server configured to use the proxy
3. Handle cleanup when you stop the servers

**Option B: Start manually**

In one terminal, start the proxy:
```bash
node proxy-server.js
```

In another terminal, start the MCP server:
```bash
awslabs.openapi-mcp-server \
  --api-name hk \
  --api-url http://localhost:3000 \
  --spec-path /workspace/hk-openapi.yaml
```

## Files

- **proxy-server.js** - Express-based reverse proxy with Basic Auth
- **package.json** - Node.js dependencies
- **.env** - Configuration and credentials (⚠️ DO NOT COMMIT THIS FILE)
- **start-with-proxy.sh** - Convenience script to start both servers
- **hk-openapi.yaml** - Your OpenAPI specification

## How It Works

1. **MCP Server** makes requests to `http://localhost:3000/...`
2. **Proxy Server** receives the request, adds `Authorization: Basic <encoded>` header
3. **Proxy Server** forwards the request to `BACKEND_URL/...`
4. **Backend API** receives authenticated request and responds
5. **Proxy Server** returns the response to the MCP Server

## Monitoring

### View Proxy Logs

```bash
tail -f proxy.log
```

### Check Proxy Status

```bash
curl http://localhost:3000
```

### Debug

The proxy server logs each request:
```
[2025-10-15T12:00:00.000Z] GET /some/path -> https://backend.com/some/path
[2025-10-15T12:00:00.100Z] GET /some/path <- 200
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
1. Change `PROXY_PORT` in `.env` to another port (e.g., 3001)
2. Update the MCP server command to use the new port

### Authentication Errors

If you get 401/403 errors:
1. Verify credentials in `.env` are correct
2. Check proxy logs: `tail -f proxy.log`
3. Test authentication manually:
   ```bash
   curl -u username:password BACKEND_URL/
   ```

### Connection Errors

If the proxy can't connect to the backend:
1. Check `BACKEND_URL` in `.env` is correct
2. Verify you have network access to the backend
3. Check for SSL/TLS certificate issues

## Security Notes

- **Never commit `.env` file** - Add it to `.gitignore`
- The proxy runs on localhost only (not accessible externally)
- Credentials are transmitted over HTTPS to the backend
- Consider using environment variables instead of `.env` in production

## Advanced Configuration

### Custom Headers

Edit `proxy-server.js` and add headers in the `onProxyReq` callback:

```javascript
onProxyReq: (proxyReq, req, res) => {
  proxyReq.setHeader('Authorization', authHeader);
  proxyReq.setHeader('X-Custom-Header', 'value');
  // ...
}
```

### Change Proxy Port

Edit `.env`:
```bash
PROXY_PORT=8080
```

Then update your MCP server command to use the new port.

### SSL/TLS Configuration

To disable SSL verification (not recommended for production):

Edit `proxy-server.js`:
```javascript
const proxyOptions = {
  // ...
  secure: false,  // Disable SSL verification
  // ...
};
```

## Alternative: Direct MCP Server Authentication

If you don't need the proxy, the MCP server supports built-in authentication:

```bash
awslabs.openapi-mcp-server \
  --api-name hk \
  --api-url BACKEND_URL/ \
  --spec-path /workspace/hk-openapi.yaml \
  --auth-type basic \
  --auth-username YOUR_USERNAME \
  --auth-password YOUR_PASSWORD
```

Use the proxy when you need:
- Custom header manipulation
- Request/response logging
- Rate limiting
- Request transformation
- Multiple authentication methods
