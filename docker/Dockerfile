FROM python:3.13-bookworm

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
  apt-get install -y nodejs

# Add PostgreSQL APT repository for latest version
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  wget \
  gnupg \
  && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install basic development tools and iptables/ipset
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  gh \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  nano \
  vim \
  libpq-dev \
  postgresql-client-18 \
  gcc \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pipx using pip to ensure it uses Python 3.13
RUN pip install --no-cache-dir pipx

# Set root password
RUN echo 'root:root123' | chpasswd

# Create claude user first
RUN groupadd -g 1001 claude && \
  useradd -m -u 1001 -g claude -s /bin/zsh claude

# Ensure default claude user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R claude:claude /usr/local/share

ARG USERNAME=claude

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=false

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/claude/.claude && \
  chown -R claude:claude /workspace /home/claude/.claude

WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Set up non-root user
USER claude

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Set the default editor and visual
ENV EDITOR=nano
ENV VISUAL=nano

# Default powerline10k theme
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Install Claude
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

# Install mongosh globally for MongoDB connections
RUN npm install -g mongosh

# Install MCP servers using pipx for isolated environment (uses Python 3.13)
RUN pipx install "awslabs.openapi-mcp-server[all]" --force && \
  pipx install postgres-mcp && \
  pipx ensurepath

USER root
RUN mkdir -p /usr/share/zsh/site-functions && \
  pipx completions > /usr/share/zsh/site-functions/_pipx
USER claude

# Add MCP servers

RUN claude mcp add petstore -- \
  awslabs.openapi-mcp-server \
  --api-name petstore \
  --api-url https://petstore3.swagger.io/api/v3 \
  --spec-url https://petstore3.swagger.io/api/v3/openapi.json

RUN  claude mcp add weather -- \
  awslabs.openapi-mcp-server \
  --api-name weather \
  --api-url https://api.weather.gov \
  --spec-url https://api.weather.gov/openapi.json

RUN claude mcp add mongodb \
  --env MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017/42" -- \
  npx -y mongodb-mcp-server@latest

# Copy resources
COPY res/* /home/workspace

# Copy and set up firewall script
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "claude ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/claude-firewall && \
  chmod 0440 /etc/sudoers.d/claude-firewall
USER claude

CMD ["tail", "-f", "/dev/null"]
