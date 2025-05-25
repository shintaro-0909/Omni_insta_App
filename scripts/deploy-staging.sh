#!/bin/bash

# Staging Deployment Script for Omniy Instagram Scheduler
set -e

echo "🧪 Starting Staging Deployment..."

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

echo -e "${YELLOW}Step 1: Building frontend for staging...${NC}"

cd frontend
npm run build -- --mode staging
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed. Deployment aborted.${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}Step 2: Building backend functions...${NC}"
cd functions
npm run build
cd ..

echo -e "${YELLOW}Step 3: Deploying to Firebase staging...${NC}"

# Deploy to staging
firebase deploy --only hosting:staging --project default
if [ $? -ne 0 ]; then
    echo -e "${RED}Staging deployment failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Staging deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your staging app is available at: https://omniy-staging.web.app${NC}"