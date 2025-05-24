# Claude Code Development Container

This directory contains the development container configuration for the Omniy Instagram Scheduler project, based on Anthropic's official reference implementation.

## Features

- **Secure Environment**: Firewall rules restrict outbound connections to whitelisted domains only
- **Pre-configured Tools**: Node.js 20, Firebase CLI, Claude Code CLI, and development extensions
- **Consistent Environment**: Same setup across all team members
- **Enhanced Security**: Allows safe use of `claude --dangerously-skip-permissions`

## Quick Start

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Usage

1. **Open in Container**
   ```bash
   # In VS Code, press Ctrl+Shift+P (Cmd+Shift+P on Mac)
   # Type: "Remote-Containers: Reopen in Container"
   ```

2. **Start Development**
   ```bash
   # The container automatically installs dependencies
   # Firebase emulators and development servers are ready to use
   
   # Start Firebase emulators
   firebase emulators:start
   
   # Start frontend development server (in another terminal)
   cd frontend && npm run dev
   
   # Start functions development (in another terminal) 
   cd functions && npm run serve
   ```

3. **Use Claude Code Safely**
   ```bash
   # The enhanced security allows bypassing permission prompts
   claude --dangerously-skip-permissions
   ```

## Configuration Files

- **`devcontainer.json`**: Main configuration with VS Code settings and port forwarding
- **`Dockerfile`**: Container image with Node.js, tools, and security setup
- **`init-firewall.sh`**: Network security rules for whitelisted domain access

## Port Forwarding

The container automatically forwards these development ports:

- `4000`: Firebase Emulator UI
- `5000`: Frontend (Vite dev server)
- `5001`: Cloud Functions emulator  
- `8080`: Firestore emulator
- `9099`: Firebase Auth emulator

## Security Model

### Network Restrictions
The firewall script allows outbound HTTPS connections only to:
- `api.anthropic.com` (Claude Code API)
- `registry.npmjs.org` (npm packages)
- `github.com` and related domains (Git operations)
- `firebase.googleapis.com` (Firebase services)
- `googleapis.com` (Google APIs)
- CDN domains for packages

### Container Isolation
- Runs as non-root `node` user
- Workspace mounted with appropriate permissions
- Command history persisted across container restarts

## Troubleshooting

### Container Build Issues
```bash
# Rebuild container from scratch
# In VS Code: Ctrl+Shift+P → "Remote-Containers: Rebuild Container"
```

### Network Issues
```bash
# Check firewall rules
sudo iptables -L OUTPUT -n --line-numbers

# Reset firewall (if needed)
sudo iptables -F OUTPUT
```

### Permission Issues
```bash
# The container is designed to work with --dangerously-skip-permissions
# If you encounter issues, verify the user is 'node' with sudo access
whoami
sudo echo "Sudo access confirmed"
```

## Development Workflow

1. **Initial Setup**: Container builds and installs all dependencies automatically
2. **Daily Development**: Use `claude --dangerously-skip-permissions` for AI assistance
3. **Testing**: Run `npm run test` in both frontend and functions directories
4. **Deployment**: Use Firebase CLI commands as normal

## Customization

To modify the container for your team's needs:

1. **Add Extensions**: Edit `devcontainer.json` → `customizations.vscode.extensions`
2. **Install Tools**: Add packages to `Dockerfile` RUN commands
3. **Network Access**: Modify `init-firewall.sh` to allow additional domains
4. **Environment Variables**: Add to `devcontainer.json` → `containerEnv`

## Security Best Practices

- ✅ Use this container for Claude Code operations
- ✅ Keep the firewall rules restrictive
- ✅ Regularly update the base Node.js image
- ❌ Don't disable firewall rules without review
- ❌ Don't run as root user in the container
- ❌ Don't commit secrets to the repository

For more information, see [Anthropic's Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code).