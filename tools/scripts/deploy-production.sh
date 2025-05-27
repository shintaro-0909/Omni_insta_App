#!/bin/bash

# Production Deployment Script for Omniy Instagram Scheduler
set -e

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}Error: firebase.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pre-deployment checks...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI not installed. Please install with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Firebase. Please run: firebase login${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Running tests...${NC}"

# Run frontend tests
cd frontend
npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}TypeScript errors found. Deployment aborted.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 3: Building frontend for production...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed. Deployment aborted.${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}Step 4: Building backend functions...${NC}"
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Functions build failed. Deployment aborted.${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}Step 5: Deploying to Firebase...${NC}"

# Deploy functions first
echo "Deploying Cloud Functions..."
firebase deploy --only functions --project default
if [ $? -ne 0 ]; then
    echo -e "${RED}Functions deployment failed.${NC}"
    exit 1
fi

# Deploy Firestore rules and indexes
echo "Deploying Firestore rules and indexes..."
firebase deploy --only firestore --project default
if [ $? -ne 0 ]; then
    echo -e "${RED}Firestore deployment failed.${NC}"
    exit 1
fi

# Deploy hosting
echo "Deploying to production hosting..."
firebase deploy --only hosting:production --project default
if [ $? -ne 0 ]; then
    echo -e "${RED}Hosting deployment failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Production deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is now live at: https://omniy-prod.web.app${NC}"

# Optional: Run post-deployment tests
echo -e "${YELLOW}Running post-deployment health checks...${NC}"
curl -f https://omniy-prod.web.app/health || echo -e "${YELLOW}Health check endpoint not available${NC}"

echo -e "${GREEN}🎉 Deployment complete! 🎉${NC}"