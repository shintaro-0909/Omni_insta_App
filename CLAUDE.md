# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omniy is an Instagram scheduling app for influencers and small businesses. It provides scheduled posting, recurring posts, and random posting through Instagram Graph API integration. The app uses Firebase/GCP infrastructure with Vue.js frontend and Cloud Functions backend.

## Common Commands

### Frontend Development
```bash
cd frontend
npm run dev              # Development server
npm run build           # Production build
npm run build-check     # Build with TypeScript checking
npm run lint            # ESLint with auto-fix
npm run type-check      # TypeScript type checking
npm run test:unit       # Run unit tests
npm run test:coverage   # Test coverage report
```

### Backend Development
```bash
cd functions
npm run build           # Compile TypeScript
npm run serve           # Local emulator with functions
npm run lint            # ESLint backend code
npm run test            # Run Jest tests
npm run test:coverage   # Backend test coverage
```

### Firebase Operations
```bash
firebase emulators:start  # Start all emulators (port 4000 for UI)
firebase deploy --only functions  # Deploy functions only
firebase deploy --only hosting   # Deploy frontend only
```

### Claude Code Operations
```bash
./scripts/start-claude.sh        # Start Claude Code (auto-detects environment)
./scripts/start-claude.sh -c     # Force devcontainer mode
./scripts/start-claude.sh -d     # Direct start (if in container)
claude --dangerously-skip-permissions  # Direct command (in secure container)
```

### Emulator Ports
- UI Dashboard: http://localhost:4000
- Hosting: http://localhost:5000
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Auth: http://localhost:9099

## Architecture Overview

### Tech Stack
- **Frontend**: Vue.js 3 + TypeScript + Vuetify + Pinia
- **Backend**: Cloud Functions (2nd Gen) + Cloud Firestore
- **Authentication**: Firebase Auth with Google provider
- **Payments**: Stripe with webhook integration
- **Scheduling**: Cloud Scheduler (1-minute intervals)
- **External API**: Instagram Graph API

### Key Architecture Patterns

#### Store Pattern (Pinia)
- `stores/auth.ts` - Authentication state
- `stores/billing.ts` - Stripe subscription management
- `stores/igAccounts.ts` - Instagram account management
- `stores/planLimits.ts` - Usage limits and restrictions
- `stores/posts.ts` - Content library management
- `stores/schedules.ts` - Schedule management

#### Cloud Functions Structure
- `api/` - HTTP endpoints for CRUD operations
- `schedulers/` - Background job processing (postExecutor.ts)
- `utils/` - Shared utilities (planLimits.ts, scheduleUtils.ts)
- `webhooks/` - Stripe webhook handling

#### Data Flow
1. User creates schedule via Vue.js frontend
2. Frontend calls Cloud Functions API
3. Schedule stored in Firestore with `nextRunAt` timestamp
4. Cloud Scheduler triggers `postExecutor` every minute
5. Executor queries pending schedules and processes via Instagram Graph API
6. Usage tracking updates user's plan limits

## Core Features Implementation

### Schedule Types
- **One-time**: `scheduleType: 'once'` with specific `scheduledAt`
- **Recurring**: `scheduleType: 'recurring'` with `repeatRule` (days of week + time)
- **Random**: `scheduleType: 'random'` with min/max intervals and time windows

### Plan Limits System
- Free: 1 account, 10 posts/month
- Basic: 3 accounts, 100 posts/month  
- Pro: 10 accounts, 1000 posts/month
- Business: Unlimited accounts, 10000 posts/month

Usage tracking in `userUsage` collection with automatic monthly resets.

### Instagram Integration
Graph API endpoints used:
- `/{user-id}/media` - Upload media
- `/{user-id}/media_publish` - Publish posts
- `/{user-id}` - Get account info
- `/oauth/access_token` - Token refresh

## Development Workflow

### Progress Tracking (Required)
Always update `docs/dev_tasks_userstories.md` when completing tasks:
- Mark completed items: `[ ]` → `[x]`
- Add implementation details (file names, function names)
- Update Sprint progress percentage
- Record next steps for partial completions

### Branch Strategy
- `feature/T{number}-{description}` for new features
- `fix/issue-{number}-{description}` for bug fixes
- `docs/{description}` for documentation
- `refactor/{target}` for refactoring

### Commit Convention
Use Conventional Commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore, perf, ci

### Testing Requirements
- Run TypeScript checks: `npm run type-check`
- Run linting: `npm run lint`
- Ensure tests pass: `npm run test`

## Security Considerations

### Firestore Security Rules
- User data isolated by `userId`
- Authentication required for all operations
- Plan limits enforced at database level

### API Keys Management
- Instagram tokens encrypted in Firestore
- Stripe keys via environment variables
- No secrets in client-side code

### Input Validation
- All Cloud Functions validate input parameters
- Rate limiting through plan restrictions
- Sanitization of user-generated content

## Key Files to Understand

### Backend Core
- `functions/src/schedulers/postExecutor.ts` - Main posting logic
- `functions/src/utils/planLimits.ts` - Usage validation
- `functions/src/utils/scheduleUtils.ts` - Schedule calculations
- `functions/src/api/instagram.ts` - Graph API integration

### Frontend Core  
- `frontend/src/views/SchedulesView.vue` - Schedule management UI
- `frontend/src/views/ContentView.vue` - Content library
- `frontend/src/views/AccountsView.vue` - Instagram account management
- `frontend/src/components/UsageDashboard.vue` - Plan limits display

### Configuration
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Query optimization
- `firebase.json` - Project configuration

## Current State

Sprint 1 completed (100% - 12/12 Must tasks). The app has full MVP functionality including:
- Scheduled posting (one-time, recurring, random)
- Multi-account Instagram management  
- Stripe payment integration
- Plan limits and usage tracking
- Content library management
- Automated posting execution

Next development focuses on Should features like proxy management and activity logging.

## GitHub Actions Integration

This repository includes Claude Code GitHub Actions integration for AI-powered automation.

### Usage
- Mention `@claude` in any issue, PR comment, or review to get AI assistance
- Assign issues to `claude` for automated implementation
- Claude follows all guidelines in this CLAUDE.md file

### Supported Actions
- Feature implementation from issue descriptions
- Bug fixes and troubleshooting
- Code review and optimization suggestions
- Documentation updates
- Testing and validation

### Security
- Only pre-approved tools are available to Claude in GitHub Actions
- All changes are validated with TypeScript checks and linting
- No dangerous operations (rm, sudo, curl) are permitted

### Best Practices for @claude Requests
- Be specific about requirements and context
- Reference relevant files or components
- Mention testing requirements if applicable
- Include acceptance criteria for features

Example:
```
@claude implement user profile editing feature in AccountsView.vue
- Add edit button to profile section
- Create modal dialog with form fields
- Validate input and handle API errors
- Follow existing Vuetify component patterns
- Include TypeScript types
```