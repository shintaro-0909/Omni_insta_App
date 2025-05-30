#!/bin/bash

# Omni Insta - Development Environment Setup Script
# This script initializes the complete development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}🚀 Omni Insta Development Environment Setup${NC}"
echo -e "${BLUE}=============================================${NC}\n"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    local missing_tools=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    else
        print_status "Node.js $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    else
        print_status "npm $(npm --version)"
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        missing_tools+=("firebase-tools")
    else
        print_status "Firebase CLI $(firebase --version | head -n1)"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    else
        print_status "Git $(git --version | cut -d' ' -f3)"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo -e "\n${YELLOW}Please install the missing tools and run this script again.${NC}"
        exit 1
    fi
    
    echo ""
}

# Setup environment files
setup_env_files() {
    echo -e "${BLUE}🔧 Setting up environment files...${NC}"
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        if [ -f "frontend/.env.local.example" ]; then
            cp "frontend/.env.local.example" "frontend/.env.local"
            print_status "Created frontend/.env.local from example"
            print_warning "Please configure your Firebase and API keys in frontend/.env.local"
        else
            print_error "frontend/.env.local.example not found"
        fi
    else
        print_status "frontend/.env.local already exists"
    fi
    
    # Functions environment
    if [ ! -f "functions/.env.local" ]; then
        if [ -f "functions/.env.local.example" ]; then
            cp "functions/.env.local.example" "functions/.env.local"
            print_status "Created functions/.env.local from example"
            print_warning "Please configure your API keys and secrets in functions/.env.local"
        else
            print_error "functions/.env.local.example not found"
        fi
    else
        print_status "functions/.env.local already exists"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install
    print_status "Frontend dependencies installed"
    
    # Backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$PROJECT_ROOT/functions"
    npm install
    print_status "Backend dependencies installed"
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Setup Firebase emulators
setup_firebase() {
    echo -e "${BLUE}🔥 Setting up Firebase emulators...${NC}"
    
    # Check if Firebase project is configured
    if [ ! -f "firebase.json" ]; then
        print_error "firebase.json not found. Please run 'firebase init' first."
        return 1
    fi
    
    # Check if user is logged in
    if ! firebase projects:list &> /dev/null; then
        print_warning "Not logged into Firebase. Running 'firebase login'..."
        firebase login
    fi
    
    print_status "Firebase configuration verified"
    echo ""
}

# Setup Git hooks
setup_git_hooks() {
    echo -e "${BLUE}🪝 Setting up Git hooks...${NC}"
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Omni Insta

echo "🔍 Running pre-commit checks..."

# Check frontend
cd frontend
echo "Checking frontend..."
npm run lint
npm run type-check

# Check backend
cd ../functions
echo "Checking backend..."
npm run lint
npm run test

echo "✅ Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_status "Git pre-commit hook installed"
    
    echo ""
}

# Setup VS Code workspace
setup_vscode() {
    echo -e "${BLUE}📝 Setting up VS Code workspace...${NC}"
    
    # Create .vscode directory if it doesn't exist
    mkdir -p .vscode
    
    # Check if settings exist
    if [ ! -f ".vscode/settings.json" ]; then
        print_warning "VS Code settings not found. Run the VS Code setup script after this."
    else
        print_status "VS Code settings configured"
    fi
    
    echo ""
}

# Verify installation
verify_installation() {
    echo -e "${BLUE}🔍 Verifying installation...${NC}"
    
    # Test frontend build
    echo -e "${YELLOW}Testing frontend build...${NC}"
    cd "$PROJECT_ROOT/frontend"
    if npm run type-check; then
        print_status "Frontend TypeScript compilation successful"
    else
        print_error "Frontend TypeScript compilation failed"
    fi
    
    # Test backend build
    echo -e "${YELLOW}Testing backend build...${NC}"
    cd "$PROJECT_ROOT/functions"
    if npm run build; then
        print_status "Backend compilation successful"
    else
        print_error "Backend compilation failed"
    fi
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Display next steps
show_next_steps() {
    echo -e "${GREEN}🎉 Development environment setup complete!${NC}\n"
    
    echo -e "${BLUE}📚 Next steps:${NC}"
    echo "1. Configure your API keys in the .env.local files"
    echo "2. Set up your Firebase project (if not already done):"
    echo "   firebase login"
    echo "   firebase use --add"
    echo "3. Start the development environment:"
    echo "   ./tools/scripts/dev-start.sh"
    echo "4. Run tests:"
    echo "   ./tools/scripts/dev-test.sh"
    echo ""
    
    echo -e "${BLUE}🔗 Useful commands:${NC}"
    echo "• Start development servers: ./tools/scripts/dev-start.sh"
    echo "• Run all tests: ./tools/scripts/dev-test.sh"
    echo "• Firebase emulator UI: http://localhost:4000"
    echo "• Frontend dev server: http://localhost:5173"
    echo "• Backend functions: http://localhost:5001"
    echo ""
    
    echo -e "${YELLOW}⚠ Important:${NC}"
    echo "• Make sure to configure your .env.local files with actual API keys"
    echo "• Never commit .env.local files to version control"
    echo "• Use the Firebase emulators for local development"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}Starting development environment setup...${NC}\n"
    
    check_prerequisites
    setup_env_files
    install_dependencies
    setup_firebase
    setup_git_hooks
    setup_vscode
    verify_installation
    show_next_steps
    
    echo -e "${GREEN}✅ Setup complete! Happy coding! 🚀${NC}"
}

# Run main function
main "$@"