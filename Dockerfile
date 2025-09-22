FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH=/usr/local/go/bin:/root/go/bin:$PATH
ENV MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017"

# Update and install base packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    gnupg \
    ca-certificates \
    build-essential \
    software-properties-common \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Go 1.23.6
RUN wget -q https://go.dev/dl/go1.23.6.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.23.6.linux-amd64.tar.gz \
    && rm go1.23.6.linux-amd64.tar.gz

# Install MongoDB 7.0
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org \
    && rm -rf /var/lib/apt/lists/*

# Create MongoDB directories
RUN mkdir -p /data/db /var/log/mongodb \
    && chown -R mongodb:mongodb /data/db /var/log/mongodb || true

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Codex CLI
RUN npm install -g @openai/codex

# Clone and build openai-to-mcp
WORKDIR /
RUN git config --global http.sslverify false \
    && git clone https://github.com/tuvia-r/openai-to-mcp.git \
    && cd openai-to-mcp \
    && npm install \
    && npm run build

# Clone swagger-mcp
RUN git clone https://github.com/danishjsheikh/swagger-mcp.git

# Install swagger-mcp Go binary
RUN go install github.com/danishjsheikh/swagger-mcp@latest

# Create MongoDB startup script
RUN cat > /usr/local/bin/start-mongodb.sh << 'EOF' && chmod +x /usr/local/bin/start-mongodb.sh
#!/bin/bash
# MongoDB startup script

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is already running"
    exit 0
fi

# Create necessary directories
mkdir -p /data/db
mkdir -p /var/log/mongodb

# Set permissions
chown -R mongodb:mongodb /data/db /var/log/mongodb 2>/dev/null || true

# Start MongoDB
echo "Starting MongoDB..."
mongod --dbpath /data/db --logpath /var/log/mongodb/mongod.log --fork --bind_ip 127.0.0.1

# Wait for MongoDB to start
sleep 2

# Check if MongoDB started successfully
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB started successfully on port 27017"
    echo "Connection string: mongodb://127.0.0.1:27017"
else
    echo "Failed to start MongoDB. Check logs at /var/log/mongodb/mongod.log"
    exit 1
fi
EOF

# Create auto-start script for MongoDB
RUN cat > /root/start-mongodb.sh << 'EOF' && chmod +x /root/start-mongodb.sh
#!/bin/bash
# Start MongoDB if not already running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db
    echo "MongoDB started."
else
    echo "MongoDB is already running."
fi
EOF

# Configure Claude MCP servers
RUN mkdir -p /root/.claude \
    && cat > /root/.claude.json << 'EOF'
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "/openai-to-mcp/dist/src/index.js",
        "--spec",
        "https://api.weather.gov/openapi.json",
        "--base-url",
        "https://api.weather.gov"
      ]
    },
    "mongodb": {
      "command": "npx",
      "args": [
        "-y",
        "mongodb-mcp-server@latest"
      ],
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017"
      }
    }
  }
}
EOF

# Configure Codex (if config exists)
RUN mkdir -p /root/.codex \
    && cat > /root/.codex/config.toml << 'EOF'
[mcp]

[mcp.servers.weather]
command = "node"
args = ["/openai-to-mcp/dist/src/index.js", "--spec", "https://api.weather.gov/openapi.json", "--base-url", "https://api.weather.gov"]

[mcp.servers.mongodb]
command = "npx"
args = ["-y", "mongodb-mcp-server@latest"]
env = { MDB_MCP_CONNECTION_STRING = "mongodb://localhost:27017" }
EOF

# Add MongoDB auto-start to bashrc
RUN echo "" >> /root/.bashrc \
    && echo "# Auto-start MongoDB" >> /root/.bashrc \
    && echo "/root/start-mongodb.sh" >> /root/.bashrc

# Create entrypoint script
RUN cat > /docker-entrypoint.sh << 'EOF' && chmod +x /docker-entrypoint.sh
#!/bin/bash
set -e

# Start MongoDB
/usr/local/bin/start-mongodb.sh

# If no command provided, start bash
if [ "$#" -eq 0 ]; then
    exec /bin/bash
else
    exec "$@"
fi
EOF

# Create project directory
RUN mkdir -p /projects

WORKDIR /

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/bin/bash"]
