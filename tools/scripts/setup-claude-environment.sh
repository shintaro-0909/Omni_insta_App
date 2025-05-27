#!/bin/bash

# Claude Code Environment Setup Script
# Usage: ./setup-claude-environment.sh [project-name] [project-type]

set -e

PROJECT_NAME=${1:-"new-project"}
PROJECT_TYPE=${2:-"web-app"}
CURRENT_DIR=$(pwd)

echo "🤖 Setting up Claude Code environment for: $PROJECT_NAME"
echo "📁 Current directory: $CURRENT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Create devcontainer configuration
print_step "Creating devcontainer configuration..."

mkdir -p .devcontainer

# Copy devcontainer files
cat > .devcontainer/devcontainer.json << 'EOF'
{
  "name": "Claude Code Development Environment",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "mounts": [
    "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached"
  ],
  "workspaceFolder": "/workspace",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-json",
        "ms-vscode-remote.remote-containers"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "zsh",
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    },
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "forwardPorts": [3000, 4000, 5000, 8080, 9099],
  "postCreateCommand": "npm install -g @anthropic-ai/claude-code",
  "postStartCommand": ".devcontainer/init-firewall.sh",
  "remoteUser": "node",
  "containerEnv": {
    "SHELL": "/bin/zsh"
  }
}
EOF

# Create Dockerfile
cat > .devcontainer/Dockerfile << 'EOF'
FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
    git zsh sudo curl wget unzip vim nano htop jq \
    netcat iputils-ping dnsutils iptables \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME

RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k
RUN echo 'ZSH_THEME="powerlevel10k/powerlevel10k"' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> ~/.zshrc

WORKDIR /workspace
ENV SHELL=/bin/zsh
ENV CLAUDE_SKIP_PERMISSIONS=true
EXPOSE 3000 4000 5000 8080 9099
CMD ["/bin/zsh"]
EOF

# Create firewall script
cat > .devcontainer/init-firewall.sh << 'EOF'
#!/bin/bash
set -e
echo "🔒 Initializing firewall rules for Claude Code sandbox..."

if ! command -v iptables &> /dev/null; then
    echo "⚠️  iptables not found, skipping firewall setup"
    exit 0
fi

# Allow essential connections
sudo iptables -A OUTPUT -o lo -j ACCEPT 2>/dev/null || true
sudo iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT 2>/dev/null || true
sudo iptables -A OUTPUT -p tcp --dport 443 -d api.anthropic.com -j ACCEPT 2>/dev/null || true
sudo iptables -A OUTPUT -p tcp --dport 443 -d registry.npmjs.org -j ACCEPT 2>/dev/null || true
sudo iptables -A OUTPUT -p tcp --dport 443 -d github.com -j ACCEPT 2>/dev/null || true

echo "✅ Firewall rules initialized"
EOF

chmod +x .devcontainer/init-firewall.sh

print_success "Devcontainer configuration created"

# Step 2: Create GitHub Actions workflow
print_step "Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/claude.yml << 'EOF'
name: Claude Code Assistant

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-response:
    if: |
      github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude') ||
      github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude') ||
      github.event_name == 'issues' && contains(github.event.issue.body, '@claude')
    
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    permissions:
      contents: write
      issues: write
      pull-requests: write
      
    steps:
      - name: Claude Code Action
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          
          allowed_tools: |
            Bash(npm install),
            Bash(npm run build),
            Bash(npm run test),
            Bash(npm run lint),
            Edit,
            Read,
            Write,
            Glob,
            Grep
          
          disallowed_tools: |
            Bash(rm -rf),
            Bash(sudo),
            TaskOutput
EOF

cat > .github/SETUP.md << 'EOF'
# GitHub Setup Instructions

## Required Secrets
Add these secrets in repository Settings → Secrets and variables → Actions:

- `ANTHROPIC_API_KEY`: Your Anthropic API key from https://console.anthropic.com

## Claude GitHub App
Install the Claude GitHub app: https://github.com/apps/claude

## Usage
Mention `@claude` in issues, PR comments, or reviews to get AI assistance.
EOF

print_success "GitHub Actions workflow created"

# Step 3: Create CLAUDE.md
print_step "Creating CLAUDE.md configuration..."

cat > CLAUDE.md << EOF
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

${PROJECT_NAME} is a ${PROJECT_TYPE} project with modern development practices and AI-powered automation.

## Common Commands

### Development
\`\`\`bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run test         # Run tests
\`\`\`

## Architecture Overview

### Tech Stack
- **Frontend**: Modern JavaScript/TypeScript framework
- **Backend**: Node.js with TypeScript
- **Database**: Database technology
- **Authentication**: Authentication provider
- **Deployment**: Cloud platform

## Development Workflow

### Branch Strategy
- \`feature/\` for new features
- \`fix/\` for bug fixes
- \`docs/\` for documentation
- \`refactor/\` for refactoring

### Commit Convention
Use Conventional Commits format:
\`\`\`
<type>(<scope>): <subject>
\`\`\`

Types: feat, fix, docs, style, refactor, test, chore

### Testing Requirements
- Run TypeScript checks: \`npm run type-check\`
- Run linting: \`npm run lint\`
- Ensure tests pass: \`npm run test\`

## GitHub Actions Integration

### Usage
- Mention \`@claude\` in any issue, PR comment, or review to get AI assistance
- Claude follows all guidelines in this CLAUDE.md file

### Best Practices for @claude Requests
- Be specific about requirements and context
- Reference relevant files or components
- Mention testing requirements if applicable

Example:
\`\`\`
@claude implement user authentication feature
- Add login/register forms
- Integrate with authentication provider
- Include proper error handling
- Follow existing code patterns
\`\`\`
EOF

print_success "CLAUDE.md created"

# Step 4: Create MCP servers directory structure
print_step "Creating MCP servers structure..."

mkdir -p mcp-servers

cat > mcp-servers/package.json << EOF
{
  "name": "${PROJECT_NAME}-mcp-servers",
  "version": "1.0.0",
  "description": "MCP servers for ${PROJECT_NAME}",
  "scripts": {
    "build": "npm run build --workspaces",
    "start": "npm run start --workspaces", 
    "dev": "npm run dev --workspaces"
  },
  "workspaces": [
    "./*/",
    "!./node_modules"
  ]
}
EOF

cat > .mcp.json << 'EOF'
{
  "mcpServers": {}
}
EOF

print_success "MCP servers structure created"

# Step 5: Create setup scripts
print_step "Creating additional setup scripts..."

mkdir -p scripts

cat > scripts/install-dependencies.sh << 'EOF'
#!/bin/bash
echo "📦 Installing all dependencies..."

# Main project
if [ -f "package.json" ]; then
    npm install
fi

# MCP servers
if [ -d "mcp-servers" ]; then
    cd mcp-servers
    for dir in */; do
        if [ -f "$dir/package.json" ]; then
            echo "Installing dependencies for $dir..."
            cd "$dir" && npm install && cd ..
        fi
    done
    cd ..
fi

echo "✅ All dependencies installed"
EOF

cat > scripts/setup-mcp.sh << 'EOF'
#!/bin/bash
echo "🔧 Setting up MCP servers..."

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code not found. Please install it first:"
    echo "npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# Register project-scoped MCP servers
if [ -d "mcp-servers" ]; then
    for dir in mcp-servers/*/; do
        if [ -f "$dir/package.json" ]; then
            server_name=$(basename "$dir")
            echo "Registering MCP server: $server_name"
            claude mcp add "$server_name" -s project "./mcp-servers/$server_name"
        fi
    done
fi

echo "✅ MCP servers registered"
claude mcp list
EOF

chmod +x scripts/*.sh

print_success "Setup scripts created"

# Step 6: Create project-specific gitignore
print_step "Creating .gitignore..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
.nuxt/
.output/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output/

# MCP build outputs
mcp-servers/*/dist/
mcp-servers/*/node_modules/
EOF

print_success ".gitignore created"

# Step 7: Summary and next steps
print_step "Environment setup complete!"

echo ""
echo "🎉 Claude Code environment has been set up for $PROJECT_NAME"
echo ""
echo "📋 What was created:"
echo "   ✅ Devcontainer configuration (.devcontainer/)"
echo "   ✅ GitHub Actions workflow (.github/workflows/claude.yml)" 
echo "   ✅ Claude configuration (CLAUDE.md)"
echo "   ✅ MCP servers structure (mcp-servers/)"
echo "   ✅ Setup scripts (scripts/)"
echo "   ✅ Project .gitignore"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./scripts/install-dependencies.sh"
echo "   2. Add your GitHub secrets (ANTHROPIC_API_KEY)"
echo "   3. Install Claude GitHub app: https://github.com/apps/claude"
echo "   4. Build and register MCP servers: ./scripts/setup-mcp.sh"
echo "   5. Open in VS Code devcontainer for full Claude integration"
echo ""
echo "💡 Usage:"
echo "   - Mention @claude in GitHub issues/PRs for AI assistance"
echo "   - Use devcontainer for secure Claude Code environment"
echo "   - MCP servers provide project-specific tools for Claude"
echo ""
print_success "Setup complete! Happy coding with Claude! 🤖"
EOF