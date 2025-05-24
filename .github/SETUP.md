# GitHub Actions Setup Guide

This guide helps repository administrators set up Claude Code GitHub Actions integration.

## Prerequisites

- Repository admin access
- Anthropic API account

## Setup Steps

### 1. Install GitHub App

Install the Claude GitHub app to your repository:
1. Visit https://github.com/apps/claude
2. Click "Install" 
3. Select your repository
4. Grant necessary permissions

### 2. Add Repository Secrets

Add the following secret to your repository:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key from https://console.anthropic.com

### 3. Verify Workflow File

The workflow file is already configured in `.github/workflows/claude.yml`. It includes:

- Secure tool restrictions
- TypeScript and linting validation
- Proper permission scoping

## Quick Setup via CLI

If you have Claude Code installed locally, you can use the automated setup:

```bash
claude /install-github-app
```

This command will guide you through the GitHub app installation and secret configuration.

## Usage

Once set up, team members can:

### In Issues
- Mention `@claude` in issue comments
- Assign issues to `claude` for automated implementation
- Create issues with `@claude` in the description

### In Pull Requests  
- Mention `@claude` in PR comments or reviews
- Get code review feedback and suggestions
- Request implementation guidance

### Example Commands

```
@claude implement the user profile editing feature
- Add edit button to AccountsView.vue
- Create modal with form validation
- Follow existing Vuetify patterns
- Include TypeScript types
```

```
@claude fix the TypeError in the dashboard component
- Check line 45 in DashboardView.vue
- Ensure proper null checking
- Update type definitions if needed
```

```
@claude review this PR for security issues
- Focus on authentication handling
- Check for potential data leaks
- Verify input validation
```

## Security Features

### Tool Restrictions
Claude can only use pre-approved tools:
- File operations (Read, Edit, Write)
- Safe bash commands (npm, git status, etc.)
- Search and navigation tools

### Prevented Operations
- System commands (rm, sudo)
- Network requests (curl, wget)
- Process management

### Validation Pipeline
Every Claude change is automatically validated with:
- TypeScript type checking
- ESLint code quality checks
- Unit tests (if available)

## Troubleshooting

### Action Not Triggering
1. Check that `@claude` is mentioned in comments
2. Verify the GitHub app is installed
3. Ensure `ANTHROPIC_API_KEY` secret exists

### Permission Errors
1. Verify GitHub app has proper repository permissions
2. Check workflow permissions in `.github/workflows/claude.yml`
3. Ensure API key is valid

### Build Failures
1. Review the validation pipeline logs
2. Check TypeScript errors in workflow output
3. Verify npm dependencies are up to date

## API Usage Considerations

- Each @claude mention consumes API credits
- Complex requests may use more tokens
- Monitor usage in Anthropic console
- Consider setting usage limits for large teams

## Best Practices

### For Issue Creation
- Include clear acceptance criteria
- Reference relevant files or components  
- Specify testing requirements
- Provide context about the feature/bug

### For Code Reviews
- Ask specific questions about implementation
- Request focus on particular aspects (security, performance)
- Include relevant code snippets in comments

### For Implementation Requests
- Break large features into smaller tasks
- Reference existing patterns to follow
- Specify error handling requirements
- Include validation and testing needs

## Team Guidelines

1. **Use descriptive requests**: Be specific about what you want Claude to do
2. **Follow project conventions**: Claude will respect the patterns in CLAUDE.md
3. **Review Claude's work**: Always review generated code before merging
4. **Test thoroughly**: Ensure functionality works as expected
5. **Monitor API usage**: Track consumption to avoid unexpected costs

## Advanced Configuration

### Custom Trigger Phrases
Edit `.github/workflows/claude.yml` to use custom triggers:

```yaml
# trigger_phrase: "/claude"
# assignee_trigger: "claude"
```

### Additional Tools
Add specific tools to the `allowed_tools` list:

```yaml
allowed_tools: |
  Bash(npm install),
  Bash(npm run test),
  Bash(firebase deploy --only functions),
  Edit,
  Read
```

### Environment Specific Settings
Configure different behavior for different environments:

```yaml
env:
  NODE_ENV: development
  FIREBASE_PROJECT: your-dev-project
```

For more information, see the [official Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/github-actions).