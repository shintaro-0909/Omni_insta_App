#!/bin/bash

# Create Claude Code Project Template
# This script creates a template repository that can be used for new projects

set -e

TEMPLATE_NAME="claude-code-project-template"
TEMPLATE_DIR="$HOME/Development/templates/$TEMPLATE_NAME"

echo "🏗️  Creating Claude Code project template..."

# Create template directory
mkdir -p "$TEMPLATE_DIR"

echo "📁 Template directory: $TEMPLATE_DIR"

# Copy essential files
cp -r .devcontainer "$TEMPLATE_DIR/"
cp -r .github "$TEMPLATE_DIR/"
cp -r scripts "$TEMPLATE_DIR/"

# Create template CLAUDE.md
cat > "$TEMPLATE_DIR/CLAUDE.md" << 'EOF'
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

{{PROJECT_NAME}} is a {{PROJECT_TYPE}} project with modern development practices and AI-powered automation.

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run test         # Run tests
```

## Architecture Overview

### Tech Stack
- **Frontend**: {{FRONTEND_TECH}}
- **Backend**: {{BACKEND_TECH}}
- **Database**: {{DATABASE_TECH}}
- **Authentication**: {{AUTH_PROVIDER}}
- **Deployment**: {{DEPLOYMENT_PLATFORM}}

## Development Workflow

### Branch Strategy
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation
- `refactor/` for refactoring

### Commit Convention
Use Conventional Commits format:
```
<type>(<scope>): <subject>
```

Types: feat, fix, docs, style, refactor, test, chore

### Testing Requirements
- Run TypeScript checks: `npm run type-check`
- Run linting: `npm run lint`
- Ensure tests pass: `npm run test`

## GitHub Actions Integration

### Usage
- Mention `@claude` in any issue, PR comment, or review to get AI assistance
- Claude follows all guidelines in this CLAUDE.md file

### Best Practices for @claude Requests
- Be specific about requirements and context
- Reference relevant files or components
- Mention testing requirements if applicable

Example:
```
@claude implement user authentication feature
- Add login/register forms
- Integrate with authentication provider
- Include proper error handling
- Follow existing code patterns
```
EOF

# Create template .gitignore
cat > "$TEMPLATE_DIR/.gitignore" << 'EOF'
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

# Create template MCP structure
mkdir -p "$TEMPLATE_DIR/mcp-servers"
cat > "$TEMPLATE_DIR/mcp-servers/README.md" << 'EOF'
# MCP Servers

This directory contains Model Context Protocol (MCP) servers for this project.

## Setup

1. Create MCP server directories as needed
2. Register with Claude Code:
   ```bash
   claude mcp add server-name -s project ./mcp-servers/server-name
   ```

## Available Templates

Use the MCP server generator script to create new servers:
```bash
./scripts/create-mcp-server.sh server-name
```
EOF

cat > "$TEMPLATE_DIR/.mcp.json" << 'EOF'
{
  "mcpServers": {}
}
EOF

# Create new project script
cat > "$TEMPLATE_DIR/create-new-project.sh" << 'EOF'
#!/bin/bash

# Create new project from Claude Code template
# Usage: ./create-new-project.sh <project-name> [project-type]

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <project-name> [project-type]"
    echo "Example: $0 my-awesome-app web-app"
    exit 1
fi

PROJECT_NAME="$1"
PROJECT_TYPE="${2:-web-app}"
PROJECT_DIR="$PWD/$PROJECT_NAME"

echo "🚀 Creating new Claude Code project: $PROJECT_NAME"
echo "📁 Target directory: $PROJECT_DIR"

# Create project directory
mkdir -p "$PROJECT_DIR"

# Copy template files
cp -r .devcontainer "$PROJECT_DIR/"
cp -r .github "$PROJECT_DIR/"
cp -r scripts "$PROJECT_DIR/"
cp -r mcp-servers "$PROJECT_DIR/"
cp .gitignore "$PROJECT_DIR/"
cp .mcp.json "$PROJECT_DIR/"

# Process CLAUDE.md template
sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
    -e "s/{{PROJECT_TYPE}}/$PROJECT_TYPE/g" \
    -e "s/{{FRONTEND_TECH}}/Modern JavaScript\/TypeScript framework/g" \
    -e "s/{{BACKEND_TECH}}/Node.js with TypeScript/g" \
    -e "s/{{DATABASE_TECH}}/Database technology/g" \
    -e "s/{{AUTH_PROVIDER}}/Authentication provider/g" \
    -e "s/{{DEPLOYMENT_PLATFORM}}/Cloud platform/g" \
    CLAUDE.md > "$PROJECT_DIR/CLAUDE.md"

# Make scripts executable
chmod +x "$PROJECT_DIR/scripts/"*.sh

# Create basic package.json
cat > "$PROJECT_DIR/package.json" << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "A $PROJECT_TYPE built with Claude Code integration",
  "scripts": {
    "dev": "echo 'Add your dev server command here'",
    "build": "echo 'Add your build command here'",
    "test": "echo 'Add your test command here'",
    "lint": "echo 'Add your lint command here'"
  },
  "keywords": ["claude-code", "$PROJECT_TYPE"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Create README
cat > "$PROJECT_DIR/README.md" << EOF
# $PROJECT_NAME

A $PROJECT_TYPE with Claude Code integration for AI-powered development.

## Quick Start

1. **Setup Environment**
   \`\`\`bash
   ./scripts/setup-claude-environment.sh
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   ./scripts/install-dependencies.sh
   \`\`\`

3. **Setup GitHub Integration**
   - Add \`ANTHROPIC_API_KEY\` to repository secrets
   - Install Claude GitHub app: https://github.com/apps/claude

4. **Open in Devcontainer**
   - Use VS Code with Remote-Containers extension
   - Or run: \`claude --dangerously-skip-permissions\`

## Features

- 🤖 Claude Code integration
- 🐳 Devcontainer environment
- 🔧 GitHub Actions automation
- 📡 MCP servers for project-specific tools
- 🛡️ Security-first configuration

## Usage

Mention \`@claude\` in GitHub issues or PRs for AI assistance!

## Development

See [CLAUDE.md](CLAUDE.md) for development guidelines and Claude Code configuration.
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. ./scripts/setup-claude-environment.sh"
echo "   3. Initialize git: git init && git add . && git commit -m 'Initial commit'"
echo "   4. Push to GitHub and setup secrets"
echo ""
echo "🎉 Happy coding with Claude! 🤖"
EOF

chmod +x "$TEMPLATE_DIR/create-new-project.sh"

# Create README for template
cat > "$TEMPLATE_DIR/README.md" << 'EOF'
# Claude Code Project Template

This template provides a complete Claude Code integration setup for new projects.

## Features

- 🤖 **Claude Code Integration**: Full AI-powered development environment
- 🐳 **Devcontainer**: Secure development container with firewall rules
- 🔧 **GitHub Actions**: Automated Claude Code responses to @claude mentions
- 📡 **MCP Servers**: Project-specific tools for Claude
- 🛡️ **Security**: Best practices and secure configuration

## Usage

### Create New Project
```bash
./create-new-project.sh my-awesome-app web-app
```

### Available Project Types
- `web-app` - Web applications
- `api` - REST/GraphQL APIs
- `library` - NPM/PyPI libraries
- `cli-tool` - Command line tools
- `mobile-app` - Mobile applications
- `desktop-app` - Desktop applications

### Manual Setup
If you prefer manual setup, copy the template files to your project and run:
```bash
./scripts/setup-claude-environment.sh your-project-name project-type
```

## What's Included

### Development Environment
- **Devcontainer**: VS Code development container with Node.js 20
- **Security**: Firewall rules for safe Claude Code operation
- **Tools**: Git, GitHub CLI, development utilities

### GitHub Integration
- **Actions Workflow**: Responds to @claude mentions in issues/PRs
- **Security**: Restricted tool access and validation pipeline
- **Setup Guide**: Instructions for repository secrets

### Project Configuration
- **CLAUDE.md**: Comprehensive project guidelines for Claude
- **MCP Servers**: Framework for project-specific AI tools
- **Scripts**: Automation for setup and maintenance

### Best Practices
- **Git Workflow**: Branch strategy and commit conventions
- **Code Quality**: Linting, formatting, and testing setup
- **Security**: Environment variable management and secrets

## Customization

### Modify Template
1. Edit files in this template directory
2. Update `create-new-project.sh` for new project types
3. Add new MCP server templates in `mcp-servers/`

### Project-Specific Changes
1. Update `CLAUDE.md` with project-specific guidelines
2. Add custom MCP servers for your tech stack
3. Modify GitHub Actions workflow as needed

## Examples

### Web Application
```bash
./create-new-project.sh my-web-app web-app
# Creates: React/Vue/Angular web application template
```

### API Server
```bash
./create-new-project.sh my-api api
# Creates: Node.js/Express API server template
```

### Library
```bash
./create-new-project.sh my-library library
# Creates: NPM library template with TypeScript
```

## Support

- 📖 [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- 🐛 [Report Issues](https://github.com/anthropics/claude-code/issues)
- 💬 [Community Discussions](https://github.com/anthropics/claude-code/discussions)

Created with ❤️ for efficient AI-powered development.
EOF

echo ""
echo "✅ Claude Code project template created!"
echo ""
echo "📁 Template location: $TEMPLATE_DIR"
echo ""
echo "🚀 To create a new project:"
echo "   cd $TEMPLATE_DIR"
echo "   ./create-new-project.sh my-new-project web-app"
echo ""
echo "💡 Consider creating a GitHub repository from this template for easy reuse!"