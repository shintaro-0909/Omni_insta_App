#!/bin/bash

# Omni Insta - Development Server Startup Script
# This script starts all development services in the correct order

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# PID files for tracking background processes
FIREBASE_PID_FILE="/tmp/omni-insta-firebase.pid"
FRONTEND_PID_FILE="/tmp/omni-insta-frontend.pid"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development servers...${NC}"
    
    # Kill Firebase emulators
    if [ -f "$FIREBASE_PID_FILE" ]; then
        firebase_pid=$(cat "$FIREBASE_PID_FILE")
        if kill -0 "$firebase_pid" 2>/dev/null; then
            kill "$firebase_pid"
            print_status "Firebase emulators stopped"
        fi
        rm -f "$FIREBASE_PID_FILE"
    fi
    
    # Kill frontend dev server
    if [ -f "$FRONTEND_PID_FILE" ]; then
        frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$frontend_pid" 2>/dev/null; then
            kill "$frontend_pid"
            print_status "Frontend dev server stopped"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Additional cleanup for any remaining processes
    pkill -f "firebase emulators:start" 2>/dev/null || true
    pkill -f "vite.*--port 5173" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Setup signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "$service_name is ready"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check if environment files exist
    if [ ! -f "frontend/.env.local" ]; then
        print_warning "frontend/.env.local not found. Creating from example..."
        if [ -f "frontend/.env.local.example" ]; then
            cp "frontend/.env.local.example" "frontend/.env.local"
            print_status "Created frontend/.env.local"
        else
            print_error "frontend/.env.local.example not found. Please run dev-setup.sh first."
            exit 1
        fi
    fi
    
    if [ ! -f "functions/.env.local" ]; then
        print_warning "functions/.env.local not found. Creating from example..."
        if [ -f "functions/.env.local.example" ]; then
            cp "functions/.env.local.example" "functions/.env.local"
            print_status "Created functions/.env.local"
        else
            print_error "functions/.env.local.example not found. Please run dev-setup.sh first."
            exit 1
        fi
    fi
    
    # Check if dependencies are installed
    if [ ! -d "frontend/node_modules" ]; then
        print_warning "Frontend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/frontend"
        npm install
        print_status "Frontend dependencies installed"
        cd "$PROJECT_ROOT"
    fi
    
    if [ ! -d "functions/node_modules" ]; then
        print_warning "Backend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/functions"
        npm install
        print_status "Backend dependencies installed"
        cd "$PROJECT_ROOT"
    fi
    
    echo ""
}

# Check for port conflicts
check_ports() {
    echo -e "${BLUE}🔍 Checking port availability...${NC}"
    
    local ports=(4000 5000 5001 5173 8080 9099)
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if check_port $port; then
            conflicts+=($port)
        fi
    done
    
    if [ ${#conflicts[@]} -ne 0 ]; then
        print_warning "The following ports are in use: ${conflicts[*]}"
        echo -e "${YELLOW}Would you like to kill existing processes and continue? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for port in "${conflicts[@]}"; do
                echo -e "${YELLOW}Killing processes on port $port...${NC}"
                lsof -ti:$port | xargs kill -9 2>/dev/null || true
            done
            sleep 2
        else
            print_error "Cannot start development servers with port conflicts"
            exit 1
        fi
    fi
    
    print_status "All required ports are available"
    echo ""
}

# Start Firebase emulators
start_firebase() {
    echo -e "${BLUE}🔥 Starting Firebase emulators...${NC}"
    
    # Build functions first
    cd "$PROJECT_ROOT/functions"
    echo -e "${YELLOW}Building Cloud Functions...${NC}"
    npm run build
    print_status "Cloud Functions built successfully"
    
    cd "$PROJECT_ROOT"
    
    # Start Firebase emulators in background
    firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data > /dev/null 2>&1 &
    firebase_pid=$!
    echo $firebase_pid > "$FIREBASE_PID_FILE"
    
    # Wait for Firebase UI to be ready
    wait_for_service "http://localhost:4000" "Firebase Emulator UI"
    
    print_status "Firebase emulators started (PID: $firebase_pid)"
    print_info "Firebase UI: http://localhost:4000"
    print_info "Functions: http://localhost:5001"
    print_info "Firestore: http://localhost:8080"
    print_info "Auth: http://localhost:9099"
    
    echo ""
}

# Start frontend development server
start_frontend() {
    echo -e "${BLUE}🌐 Starting frontend development server...${NC}"
    
    cd "$PROJECT_ROOT/frontend"
    
    # Start Vite dev server in background
    npm run dev > /dev/null 2>&1 &
    frontend_pid=$!
    echo $frontend_pid > "$FRONTEND_PID_FILE"
    
    # Wait for frontend to be ready
    wait_for_service "http://localhost:5173" "Frontend development server"
    
    print_status "Frontend development server started (PID: $frontend_pid)"
    print_info "Frontend: http://localhost:5173"
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Display service status
show_status() {
    echo -e "${GREEN}🎉 All development services are running!${NC}\n"
    
    echo -e "${PURPLE}📊 Service Status:${NC}"
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│ Service               │ URL             │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│ Frontend              │ localhost:5173  │${NC}"
    echo -e "${CYAN}│ Firebase UI           │ localhost:4000  │${NC}"
    echo -e "${CYAN}│ Cloud Functions       │ localhost:5001  │${NC}"
    echo -e "${CYAN}│ Firestore Emulator    │ localhost:8080  │${NC}"
    echo -e "${CYAN}│ Auth Emulator         │ localhost:9099  │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
    
    echo -e "\n${BLUE}🔗 Quick Links:${NC}"
    echo "• Main App: http://localhost:5173"
    echo "• Firebase Console: http://localhost:4000"
    echo "• API Docs: http://localhost:5001/docs (if available)"
    
    echo -e "\n${BLUE}💡 Development Tips:${NC}"
    echo "• Hot reload is enabled for both frontend and backend"
    echo "• Check the Firebase UI for database and auth status"
    echo "• Use the browser dev tools for debugging"
    echo "• View logs in this terminal"
    
    echo -e "\n${YELLOW}⚠ To stop all services, press Ctrl+C${NC}\n"
}

# Monitor services
monitor_services() {
    echo -e "${BLUE}🔍 Monitoring services... (Press Ctrl+C to stop)${NC}\n"
    
    while true; do
        # Check if Firebase emulators are still running
        if [ -f "$FIREBASE_PID_FILE" ]; then
            firebase_pid=$(cat "$FIREBASE_PID_FILE")
            if ! kill -0 "$firebase_pid" 2>/dev/null; then
                print_error "Firebase emulators stopped unexpectedly"
                rm -f "$FIREBASE_PID_FILE"
            fi
        fi
        
        # Check if frontend dev server is still running
        if [ -f "$FRONTEND_PID_FILE" ]; then
            frontend_pid=$(cat "$FRONTEND_PID_FILE")
            if ! kill -0 "$frontend_pid" 2>/dev/null; then
                print_error "Frontend dev server stopped unexpectedly"
                rm -f "$FRONTEND_PID_FILE"
            fi
        fi
        
        sleep 5
    done
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Omni Insta Development Environment${NC}"
    echo -e "${BLUE}===============================================${NC}\n"
    
    check_prerequisites
    check_ports
    start_firebase
    start_frontend
    show_status
    monitor_services
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Start Omni Insta development environment"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-frontend  Start only Firebase emulators"
        echo "  --no-firebase  Start only frontend server"
        echo ""
        exit 0
        ;;
    --no-frontend)
        echo -e "${BLUE}🚀 Starting Firebase emulators only${NC}\n"
        check_prerequisites
        check_ports
        start_firebase
        echo -e "${GREEN}✅ Firebase emulators started${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        monitor_services
        ;;
    --no-firebase)
        echo -e "${BLUE}🚀 Starting frontend only${NC}\n"
        check_prerequisites
        check_ports
        start_frontend
        echo -e "${GREEN}✅ Frontend development server started${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        monitor_services
        ;;
    *)
        main "$@"
        ;;
esac