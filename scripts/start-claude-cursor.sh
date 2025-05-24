#!/bin/bash

# Claude Code Startup Script for Cursor
# This script provides easy access to Claude Code with Cursor editor

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Claude Code + Cursor Setup                   ║"
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

# Start in Cursor devcontainer
start_cursor_devcontainer() {
    print_info "Setting up Claude Code with Cursor devcontainer..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Open project in Cursor
    if command -v cursor &> /dev/null; then
        print_info "Opening project in Cursor..."
        cursor .
        echo ""
        print_success "Cursor opened! Next steps:"
        echo ""
        echo "📋 Manual Steps in Cursor:"
        echo "1. Install 'Remote - Containers' extension if not installed"
        echo "2. Press Cmd+Shift+P (Command Palette)"
        echo "3. Type: 'Remote-Containers: Reopen in Container'"
        echo "4. Wait for container to build and start"
        echo "5. Open terminal in container"
        echo "6. Run: claude --dangerously-skip-permissions"
        echo ""
        echo "🔧 Alternative: Use integrated terminal method below"
    else
        print_warning "Cursor command not found. Please:"
        echo "1. Open Cursor manually"
        echo "2. Open this project folder"
        echo "3. Follow the devcontainer steps above"
    fi
}

# Start Claude Code directly if in container
start_claude_in_container() {
    print_info "Starting Claude Code in container environment..."
    
    # Set environment variables
    export CLAUDE_SKIP_PERMISSIONS=true
    export CLAUDE_SANDBOX_MODE=true
    
    # Check if Claude Code is installed
    if ! command -v claude &> /dev/null; then
        print_warning "Claude Code not found. Installing..."
        npm install -g @anthropic-ai/claude-code
    fi
    
    print_success "Container environment detected!"
    echo ""
    print_info "Project Information:"
    echo "📁 Project: Omniy Instagram Scheduler"
    echo "🏗️  Type: Web Application (Vue.js + Firebase)"
    echo "📋 Status: Sprint 1 Complete (100%)"
    echo "🔧 Tools: MCP Servers, GitHub Actions, Devcontainer"
    echo "✨ Editor: Cursor + Claude Code"
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
    echo ""
    claude --dangerously-skip-permissions
}

# Alternative: Terminal-based approach
start_terminal_approach() {
    print_info "Alternative: Terminal-based approach..."
    echo ""
    echo "🔧 If devcontainer doesn't work, try this:"
    echo ""
    echo "1. Keep Cursor open for editing"
    echo "2. Use terminal for Claude Code:"
    echo ""
    echo "   # In a separate terminal:"
    echo "   docker run -it --rm \\"
    echo "     -v \"\$(pwd):/workspace\" \\"
    echo "     -w /workspace \\"
    echo "     -e CLAUDE_SKIP_PERMISSIONS=true \\"
    echo "     -e CLAUDE_SANDBOX_MODE=true \\"
    echo "     node:20-bullseye bash"
    echo ""
    echo "   # Inside the container:"
    echo "   npm install -g @anthropic-ai/claude-code"
    echo "   claude --dangerously-skip-permissions"
    echo ""
    echo "3. Use Cursor for code editing and Claude Code for AI assistance"
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --devcontainer, -d    Open Cursor with devcontainer (recommended)"
    echo "  --terminal, -t        Show terminal-based approach"
    echo "  --direct             Start Claude directly (if in container)"
    echo "  --help, -h           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Auto-detect and start"
    echo "  $0 --devcontainer    # Use Cursor devcontainer"
    echo "  $0 --terminal        # Show terminal approach"
}

# Main function
main() {
    local use_devcontainer=false
    local use_terminal=false
    local force_direct=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --devcontainer|-d)
                use_devcontainer=true
                shift
                ;;
            --terminal|-t)
                use_terminal=true
                shift
                ;;
            --direct)
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
    
    # Determine approach
    if [[ "$force_direct" == "true" ]]; then
        start_claude_in_container
    elif [[ "$use_terminal" == "true" ]]; then
        start_terminal_approach
    elif [[ "$use_devcontainer" == "true" ]] || check_environment; then
        if check_environment; then
            start_claude_in_container
        else
            start_cursor_devcontainer
        fi
    else
        start_cursor_devcontainer
        echo ""
        start_terminal_approach
    fi
}

# Run main function with all arguments
main "$@"