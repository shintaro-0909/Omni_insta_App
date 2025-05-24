# Omniy MCP Servers

This directory contains Model Context Protocol (MCP) servers specifically designed for the Omniy Instagram Scheduler project.

## Project-Specific MCP Servers

### 📸 Instagram API Server
**Path:** `./instagram-api/`
**Purpose:** Instagram Graph API operations and content management

**Features:**
- Instagram account management
- Media upload and publishing
- Post insights and analytics
- Token management and validation
- Hashtag research
- Posting limit monitoring

**Setup:**
```bash
cd mcp-servers/instagram-api
npm install
npm run build
```

### 🔥 Firebase Admin Server
**Path:** `./firebase-admin/`
**Purpose:** Firebase Admin operations and database management

**Features:**
- Firestore CRUD operations
- User authentication management
- Collection statistics and analysis
- Transaction support
- Data backup and recovery
- Custom claims management

**Setup:**
```bash
cd mcp-servers/firebase-admin
npm install
npm run build
```

## Configuration

### Project Scope Registration
These servers are configured for project-wide use in `.mcp.json`:

```bash
# Register Instagram API server
claude mcp add instagram-api -s project ./mcp-servers/instagram-api

# Register Firebase Admin server  
claude mcp add firebase-admin -s project ./mcp-servers/firebase-admin
```

### Environment Variables

#### Instagram API Server
Create `mcp-servers/instagram-api/.env`:
```bash
# Instagram API tokens will be managed by the main application
# No additional environment variables needed
```

#### Firebase Admin Server
Create `mcp-servers/firebase-admin/.env`:
```bash
FIREBASE_PROJECT_ID=omniy-dev
# Service account credentials managed by Firebase Admin SDK
```

## Usage Examples

### Instagram Operations
```
Get Instagram accounts for user ID 12345 with token abc123
Upload media to account 67890 with image URL https://example.com/image.jpg and caption "Hello World!"
Publish media container 555666 to account 67890
Get media insights for post 777888
```

### Firebase Operations
```
Query schedules collection where userId == "user123" limit 10
Get document from users collection with ID "user123"
Create document in posts collection with data {"title": "My Post", "content": "Hello"}
Update document user123 in users collection with {"lastLogin": "2024-01-24"}
Get user info for UID "firebase-user-123"
```

## Integration with Main Application

### Sharing Data
- Both servers can access the same Firebase project
- Instagram tokens stored securely in Firestore
- User data synchronized between systems

### Security
- Project-scoped servers inherit application security
- Firebase Admin uses service account credentials
- Instagram API uses encrypted tokens from database

### Development Workflow
1. **Local Development**: Use development Firebase project
2. **Testing**: Validate operations before main app integration
3. **Production**: Switch to production Firebase project

## Building and Deployment

### Build All Servers
```bash
# From project root
npm run build:mcp

# Or individually
cd mcp-servers/instagram-api && npm run build
cd mcp-servers/firebase-admin && npm run build
```

### Testing
```bash
# Test Instagram API server
cd mcp-servers/instagram-api && npm start

# Test Firebase Admin server
cd mcp-servers/firebase-admin && npm start
```

## Troubleshooting

### Common Issues

#### Instagram API Errors
- **Token Expired**: Use `refresh_token` tool
- **Rate Limits**: Check `check_posting_limits` output
- **Invalid URLs**: Ensure media URLs are publicly accessible

#### Firebase Admin Errors
- **Permission Denied**: Check Firestore security rules
- **Project Not Found**: Verify FIREBASE_PROJECT_ID
- **Auth Errors**: Ensure service account has proper permissions

### Debug Mode
Enable debug logging by setting:
```bash
export NODE_ENV=development
export DEBUG=mcp:*
```

## Best Practices

### Error Handling
- Always validate inputs before API calls
- Implement retry logic for transient failures
- Log errors for debugging

### Performance
- Cache frequently accessed data
- Use transactions for multi-step operations
- Implement pagination for large datasets

### Security
- Never log sensitive tokens or data
- Validate all user inputs
- Use least-privilege permissions

## Contributing

When adding new MCP servers:
1. Follow the existing directory structure
2. Include comprehensive TypeScript types
3. Add proper error handling and validation
4. Update this README with new functionality
5. Test thoroughly before committing

For more information about MCP, see the [official documentation](https://docs.anthropic.com/en/docs/claude-code).