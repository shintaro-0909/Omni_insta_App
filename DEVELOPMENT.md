# Omni Insta Development Guide

This comprehensive guide covers everything you need to know for developing the Omni Insta Instagram scheduling application.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 8+ or **yarn** 1.22+
- **Firebase CLI** (latest version)
- **Git** 2.30+
- **VS Code** (recommended) with our extension pack

### One-Command Setup

```bash
# Clone and setup the entire development environment
./tools/scripts/dev-setup.sh
```

### Manual Setup

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../functions && npm install

# 2. Configure environment
cp frontend/.env.local.example frontend/.env.local
cp functions/.env.local.example functions/.env.local
# Edit the .env.local files with your configuration

# 3. Start development servers
./tools/scripts/dev-start.sh
```

## 📁 Project Structure

```
omni-insta/
├── frontend/              # Vue.js 3 + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia state management
│   │   ├── services/      # API and external services
│   │   └── utils/         # Utility functions
│   ├── cypress/           # E2E tests
│   └── test/              # Unit test configuration
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   ├── api/           # HTTP endpoints
│   │   ├── schedulers/    # Background job processors
│   │   └── utils/         # Shared utilities
│   └── __tests__/         # Backend tests
├── tools/                 # Development tools and scripts
│   ├── scripts/           # Automation scripts
│   └── docs/              # Project documentation
└── .vscode/               # VS Code configuration
```

## 🛠 Development Workflow

### Starting Development

```bash
# Start all services (recommended)
./tools/scripts/dev-start.sh

# Start only frontend (if backend is running elsewhere)
./tools/scripts/dev-start.sh --no-firebase

# Start only backend (if frontend is running elsewhere)
./tools/scripts/dev-start.sh --no-frontend
```

**Available Services:**
- Frontend: http://localhost:5173
- Firebase UI: http://localhost:4000
- Functions API: http://localhost:5001
- Firestore: http://localhost:8080
- Auth Emulator: http://localhost:9099

### Code Quality

```bash
# Run all tests and quality checks
./tools/scripts/dev-test.sh

# Quick checks (lint + type-check + build)
./tools/scripts/dev-test.sh --quick

# Frontend only
./tools/scripts/dev-test.sh --frontend-only

# Backend only
./tools/scripts/dev-test.sh --backend-only

# Security audit
./tools/scripts/dev-test.sh --security
```

### Available Scripts

#### Frontend Scripts
```bash
cd frontend

# Development
npm run dev                 # Start dev server
npm run dev:open           # Start dev server and open browser
npm run dev:host           # Start dev server accessible from network

# Building
npm run build              # Production build
npm run build:clean        # Clean build (removes dist first)
npm run build:analyze      # Build with bundle analysis

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run E2E tests
npm run test:e2e:open      # Open Cypress GUI

# Code Quality
npm run lint               # Lint and fix issues
npm run lint:check         # Check linting without fixing
npm run format             # Format code with Prettier
npm run type-check         # TypeScript type checking

# Performance
npm run lighthouse         # Run Lighthouse audit
npm run analyze:bundle     # Analyze bundle size
npm run analyze:deps       # Check for unused dependencies
```

#### Backend Scripts
```bash
cd functions

# Development
npm run build              # Compile TypeScript
npm run build:watch        # Watch mode compilation
npm run serve              # Start with emulators
npm run serve:debug        # Start with debugging enabled

# Testing
npm run test               # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:integration   # Run integration tests

# Code Quality
npm run lint               # Lint and fix issues
npm run format             # Format code with Prettier
npm run type-check         # TypeScript type checking

# Deployment
npm run deploy             # Deploy to default project
npm run deploy:staging     # Deploy to staging
npm run deploy:production  # Deploy to production
```

## 🐳 Docker Development

### Using Docker Compose

```bash
# Start full development environment
docker-compose -f docker-compose.dev.yml up

# Start specific services
docker-compose -f docker-compose.dev.yml up frontend backend

# Start with additional tools
docker-compose -f docker-compose.dev.yml --profile tools up

# Start testing environment
docker-compose -f docker-compose.dev.yml --profile test up test-runner

# Production preview
docker-compose -f docker-compose.dev.yml --profile preview up prod-preview
```

### Docker Targets

- **frontend-dev**: Frontend development server
- **backend-dev**: Backend with Firebase emulators
- **test**: Testing environment
- **prod-dev**: Production-like preview

## 🧪 Testing Strategy

### Unit Tests
- **Frontend**: Vitest + Vue Test Utils
- **Backend**: Jest + Firebase Test SDK
- **Coverage**: Minimum 80% required

### Integration Tests
- Firebase emulator integration
- API endpoint testing
- Database operations

### E2E Tests
- Cypress for user workflows
- Critical path testing
- Cross-browser compatibility

### Performance Tests
- Lighthouse CI integration
- Bundle size monitoring
- Core Web Vitals tracking

## 🔧 VS Code Configuration

### Recommended Extensions
Our `.vscode/extensions.json` includes:
- **Vue.volar**: Vue 3 support
- **esbenp.prettier-vscode**: Code formatting
- **dbaeumer.vscode-eslint**: Linting
- **firebase.vscode-firebase-explorer**: Firebase tools
- **eamodio.gitlens**: Git enhancement

### Debugging Setup
- **Frontend**: Chrome/Edge debugging configured
- **Backend**: Node.js debugging with source maps
- **Tests**: Debug configuration for Vitest and Jest

### Tasks and Launch Configurations
- Build tasks for frontend and backend
- Test runners with debugging
- Firebase emulator startup
- Full-stack debugging compound

## 🔥 Firebase Development

### Emulator Usage
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only functions,firestore,auth

# Export data
firebase emulators:export ./firebase-data

# Import data
firebase emulators:start --import=./firebase-data
```

### Security Rules Testing
```bash
# Test Firestore rules
npm run test:rules

# Interactive rules testing
firebase emulators:start --only firestore
# Visit http://localhost:4000/firestore for rule testing
```

### Functions Development
```bash
# Local function testing
cd functions
npm run serve

# Deploy single function
firebase deploy --only functions:functionName

# View logs
firebase functions:log --follow
```

## 🎨 Code Style Guide

### TypeScript/JavaScript
- Use **TypeScript** for all new code
- Prefer **const** over **let**, avoid **var**
- Use **async/await** over Promises
- Implement proper error handling
- Add JSDoc comments for public APIs

### Vue.js
- Use **Composition API** with `<script setup>`
- Follow **single-file component** structure
- Use **PascalCase** for component names
- Implement **prop validation** with TypeScript

### CSS/Styling
- Use **Vuetify** components when possible
- Follow **mobile-first** responsive design
- Use **CSS custom properties** for theming
- Implement **dark mode** support

### File Naming
- Components: `PascalCase.vue`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts`
- Test files: `*.test.ts` or `*.spec.ts`

## 🚦 Git Workflow

### Branch Naming
- Features: `feature/T123-add-instagram-posting`
- Fixes: `fix/resolve-auth-issue`
- Docs: `docs/update-development-guide`

### Commit Messages
Follow Conventional Commits:
```
feat(auth): add Google OAuth integration
fix(ui): resolve mobile navigation issues
docs(api): update Instagram API documentation
test(functions): add unit tests for scheduler
```

### Pre-commit Hooks
Automatic checks on commit:
- TypeScript compilation
- ESLint validation
- Prettier formatting
- Unit test execution
- Secret detection

## 📊 Performance Monitoring

### Frontend Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: Track with webpack-bundle-analyzer
- **Lighthouse Scores**: CI/CD integration

### Backend Metrics
- **Function Performance**: Execution time, memory usage
- **API Response Times**: Monitor endpoint performance
- **Error Rates**: Track and alert on failures

### Monitoring Tools
- **Firebase Performance**: Real user monitoring
- **Lighthouse CI**: Automated performance testing
- **Bundle Analysis**: Size and dependency tracking

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` files
- Use different keys for development/production
- Rotate API keys regularly

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Enable CORS properly

### Firebase Security
- Write restrictive Firestore rules
- Use authentication for all operations
- Regularly audit security rules

## 🐛 Debugging Guide

### Frontend Debugging
```bash
# Browser DevTools
npm run dev  # Source maps enabled

# Vue DevTools
# Install browser extension for component inspection

# Debug with VS Code
# Use "Debug Frontend (Chrome)" launch configuration
```

### Backend Debugging
```bash
# Node.js debugging
npm run serve:debug

# Firebase Functions debugging
firebase emulators:start --inspect-functions

# VS Code debugging
# Use "Debug Cloud Functions" launch configuration
```

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -ti:5173

# Kill process on port
kill -9 $(lsof -ti:5173)
```

#### Firebase Emulator Issues
```bash
# Clear emulator data
rm -rf firebase-data

# Reset emulators
firebase emulators:start --import=./seed-data
```

#### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update
```

## 📚 Additional Resources

### Documentation
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### APIs Used
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Stripe API](https://stripe.com/docs/api)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Project-Specific Docs
- [Architecture Overview](./tools/docs/TECHNICAL_SPECIFICATIONS.md)
- [API Documentation](./tools/docs/api/)
- [Deployment Guide](./tools/docs/deployment-guide.md)
- [User Guide](./tools/docs/USER_GUIDE.md)

## 🆘 Getting Help

### Quick Solutions
1. **Check this guide** for common solutions
2. **Review error logs** in browser/terminal
3. **Verify environment configuration**
4. **Restart development servers**

### Development Support
- Create issue with detailed error description
- Include environment information
- Provide steps to reproduce
- Attach relevant logs

### Emergency Contacts
- Technical issues: Check GitHub Issues
- Production issues: Review incident response plan
- Security concerns: Follow security protocols

---

**Happy Coding! 🚀**

This development environment is designed for productivity and quality. If you encounter any issues or have suggestions for improvements, please contribute to making it better for everyone.