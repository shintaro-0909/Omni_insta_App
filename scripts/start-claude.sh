#!/bin/bash

# Claude Code Startup Script for Omniy Project
# This script provides easy access to Claude Code with proper permissions

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   Claude Code Startup                       ║"
    echo "║                  Omniy Instagram Scheduler                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're inside devcontainer
check_environment() {
    if [[ -n "$CODESPACES" ]] || [[ -n "$REMOTE_CONTAINERS" ]] || [[ "$CLAUDE_SANDBOX_MODE" == "true" ]]; then
        return 0  # We're in a container environment
    else
        return 1  # We're on the host system
    fi
}

# Start Claude Code in devcontainer
start_in_devcontainer() {
    print_info "Starting Claude Code in secure devcontainer environment..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if VS Code is available
    if command -v code &> /dev/null; then
        print_info "Opening project in VS Code devcontainer..."
        code .
        echo ""
        print_success "VS Code opened. Please:"
        echo "1. Click 'Reopen in Container' when prompted"
        echo "2. Or use Command Palette: 'Remote-Containers: Reopen in Container'"
        echo "3. Once in container, open terminal and run: claude --dangerously-skip-permissions"
    else
        print_warning "VS Code not found. You can manually start the devcontainer:"
        echo "1. Open VS Code"
        echo "2. Open this project folder"
        echo "3. Use Command Palette: 'Remote-Containers: Reopen in Container'"
    fi
}

# Start Claude Code directly (if in container)
start_claude_direct() {
    print_info "Starting Claude Code with skip permissions..."
    
    # Set environment variables
    export CLAUDE_SKIP_PERMISSIONS=true
    export CLAUDE_SANDBOX_MODE=true
    
    # Check if Claude Code is installed
    if ! command -v claude &> /dev/null; then
        print_warning "Claude Code not found. Installing..."
        npm install -g @anthropic-ai/claude-code
    fi
    
    print_success "Environment configured for secure Claude Code operation"
    echo ""
    print_info "Project Information:"
    echo "📁 Project: Omniy Instagram Scheduler"
    echo "🏗️  Type: Web Application (Vue.js + Firebase)"
    echo "📋 Status: Sprint 1 Complete (100%)"
    echo "🔧 Tools: MCP Servers, GitHub Actions, Devcontainer"
    echo ""
    print_info "Available Commands:"
    echo "• Frontend: cd frontend && npm run dev"
    echo "• Backend: cd functions && npm run serve"
    echo "• Firebase: firebase emulators:start"
    echo "• Tests: npm run test"
    echo "• Lint: npm run lint"
    echo ""
    
    # Start Claude Code
    print_success "Starting Claude Code..."
    claude --dangerously-skip-permissions
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --container, -c    Force start in devcontainer mode"
    echo "  --direct, -d       Force direct start (if already in container)"
    echo "  --help, -h         Show this help message"
    echo ""
    echo "Environment Detection:"
    echo "  - Automatically detects if running in devcontainer"
    echo "  - Uses appropriate startup method"
    echo ""
    echo "Examples:"
    echo "  $0                 # Auto-detect environment and start"
    echo "  $0 --container     # Open VS Code devcontainer"
    echo "  $0 --direct        # Start Claude directly (container only)"
}

# Main function
main() {
    local force_container=false
    local force_direct=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --container|-c)
                force_container=true
                shift
                ;;
            --direct|-d)
                force_direct=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    
    # Determine startup method
    if [[ "$force_container" == "true" ]]; then
        start_in_devcontainer
    elif [[ "$force_direct" == "true" ]]; then
        start_claude_direct
    elif check_environment; then
        print_success "Detected container environment"
        start_claude_direct
    else
        print_info "Detected host environment"
        start_in_devcontainer
    fi
}

# Run main function with all arguments
main "$@"