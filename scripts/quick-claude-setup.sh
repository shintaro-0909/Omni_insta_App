#!/bin/bash

# Quick Claude Code Setup - One-liner script
# Usage: curl -sSL https://your-domain.com/quick-claude-setup.sh | bash -s "project-name" "project-type"

set -e

PROJECT_NAME="${1:-$(basename $PWD)}"
PROJECT_TYPE="${2:-web-app}"

echo "🚀 Quick Claude Code Setup for: $PROJECT_NAME"

# Create all necessary files in one go
setup_devcontainer() {
    mkdir -p .devcontainer
    
    cat > .devcontainer/devcontainer.json << 'EOF'
{
  "name": "Claude Code Development Environment",
  "build": { "dockerfile": "Dockerfile" },
  "mounts": ["source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached"],
  "workspaceFolder": "/workspace",
  "customizations": {
    "vscode": {
      "extensions": ["ms-vscode.vscode-typescript-next", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"],
      "settings": { "terminal.integrated.defaultProfile.linux": "zsh" }
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "20" },
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "postCreateCommand": "npm install -g @anthropic-ai/claude-code",
  "remoteUser": "node"
}
EOF

    cat > .devcontainer/Dockerfile << 'EOF'
FROM node:20-bullseye
RUN apt-get update && apt-get install -y git zsh sudo curl && rm -rf /var/lib/apt/lists/*
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME
USER $USERNAME
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
WORKDIR /workspace
ENV SHELL=/bin/zsh
CMD ["/bin/zsh"]
EOF
}

setup_github_actions() {
    mkdir -p .github/workflows
    
    cat > .github/workflows/claude.yml << 'EOF'
name: Claude Code Assistant
on:
  issue_comment: { types: [created] }
  pull_request_review_comment: { types: [created] }
  issues: { types: [opened] }

jobs:
  claude-response:
    if: contains(github.event.comment.body, '@claude') || contains(github.event.issue.body, '@claude')
    runs-on: ubuntu-latest
    permissions: { contents: write, issues: write, pull-requests: write }
    steps:
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
EOF
}

setup_claude_config() {
    cat > CLAUDE.md << EOF
# CLAUDE.md

## Project Overview
${PROJECT_NAME} is a ${PROJECT_TYPE} with Claude Code integration.

## Common Commands
\`\`\`bash
npm run dev    # Development server
npm run build  # Production build
npm run test   # Run tests
npm run lint   # Code linting
\`\`\`

## GitHub Actions Integration
Mention \`@claude\` in issues/PRs for AI assistance.

## Development Workflow
- Use conventional commits
- Create feature branches
- Request code reviews from @claude
EOF
}

setup_mcp_structure() {
    mkdir -p mcp-servers
    echo '{"mcpServers": {}}' > .mcp.json
    echo "# MCP Servers for $PROJECT_NAME" > mcp-servers/README.md
}

# Execute setup
echo "📁 Setting up devcontainer..."
setup_devcontainer

echo "🔧 Setting up GitHub Actions..."
setup_github_actions

echo "📝 Creating Claude configuration..."
setup_claude_config

echo "📡 Setting up MCP structure..."
setup_mcp_structure

echo ""
echo "✅ Quick Claude Code setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Add ANTHROPIC_API_KEY to GitHub secrets"
echo "   2. Install Claude GitHub app: https://github.com/apps/claude"
echo "   3. Open in VS Code devcontainer"
echo "   4. Mention @claude in issues for AI assistance"
echo ""
echo "💡 Full setup available with: ./scripts/setup-claude-environment.sh"