# Local Development Setup

This guide provides comprehensive instructions for setting up a local development environment for Decipad, including prerequisites, configuration, debugging, and advanced features.

> **New to Decipad?** Start with our [New Developer Guide](README.md#new-developer-guide) for a step-by-step walkthrough.

## Quick Navigation

- [Prerequisites](#prerequisites) - Required software and tools
- [Initial Setup](#initial-setup) - Get the code and install dependencies
- [Environment Configuration](#environment-configuration) - Set up API keys and secrets
- [AWS Configuration](#aws-configuration) - AWS setup for full functionality
- [Development Server](#development-server) - Start coding
- [Debugging](#debugging) - Troubleshoot issues
- [Testing](#testing) - Run tests and verify changes
- [Advanced Features](#advanced-features) - SSR, AI features, and more

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

- **Node.js**: Version 24.0.0 or higher ([Download](https://nodejs.org/))
- **Yarn**: Package manager ([Installation guide](https://yarnpkg.com/getting-started/install))
- **Git**: Version control ([Download](https://git-scm.com/downloads))
- **Rust**: For WebAssembly compilation ([Installation guide](https://rustup.rs/))
- **wasm-pack**: WebAssembly packaging tool
  ```bash
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
  ```

### Optional but Recommended

- **Docker**: For containerized development
- **VS Code**: With recommended extensions
- **Postman**: For API testing

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/decipad/decipad.git
cd decipad
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all dependencies and automatically:

- Build the WebAssembly modules
- Apply necessary patches
- Build the backend

### 3. Environment Configuration

Decipad uses environment variables for all configuration. **Never commit real API keys or secrets to the repository.**

#### Quick Setup

```bash
# Copy the example environment file
cp .env.example .env.local

# Create backend environment file
touch apps/backend/.env

# Edit with your actual values
# Use your preferred editor (VS Code, vim, nano, etc.)
code .env.local  # or vim .env.local
code apps/backend/.env  # Edit backend environment variables
```

#### Backend Environment Configuration

The backend service requires its own environment file at `apps/backend/.env`. This file is critical for the backend to function properly in local development.

**Create the backend environment file:**

```bash
# Create the backend .env file
touch apps/backend/.env
```

**Essential variables for `apps/backend/.env`:**

```bash
# CRITICAL: These URLs MUST be set correctly for local development
DECI_APP_URL_BASE=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000/api/auth

# JWT Secret (generate a strong random string)
JWT_SECRET=your_strong_jwt_secret_here

# Email configuration (REQUIRED for user login)
DECI_FROM_EMAIL_ADDRESS=Decipad<info@yourdomain.com>
MAILERSEND_API_KEY=your_mailersend_api_key

# AWS configuration (for full functionality)
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

#### Required Environment Variables

For basic local development, you need to configure these essential variables:

> **⚠️ CRITICAL FOR LOCAL DEVELOPMENT**: The `NEXTAUTH_URL` and `DECI_APP_URL_BASE` variables **MUST** be set correctly in `apps/backend/.env` for local development to work properly. These URLs are used for authentication callbacks and API routing, and incorrect values will cause login failures and broken functionality.

**Core Application:**

```bash
# Application URLs - MUST be set correctly for local development
# These variables should be defined in apps/backend/.env
DECI_APP_URL_BASE=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000/api/auth

# JWT Secret (generate a strong random string)
JWT_SECRET=your_strong_jwt_secret_here

# Email configuration (REQUIRED for user login)
DECI_FROM_EMAIL_ADDRESS=Decipad<info@yourdomain.com>
MAILERSEND_API_KEY=your_mailersend_api_key
```

**AWS Configuration (for full functionality):**

```bash
# AWS credentials (required for S3, DynamoDB, Lambda)
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# S3 buckets (create these in your AWS account)
DECI_S3_ENDPOINT=s3.eu-west-2.amazonaws.com
DECI_S3_ACCESS_KEY_ID=your_s3_access_key_id
DECI_S3_SECRET_ACCESS_KEY=your_s3_secret_access_key
DECI_S3_PADS_BUCKET=your_pads_bucket
DECI_S3_PAD_BACKUPS_BUCKET=your_pad_backups_bucket
DECI_S3_ATTACHMENTS_BUCKET=your_attachments_bucket
```

**Email Services (required for user authentication):**

```bash
# Email configuration (required for user login)
DECI_FROM_EMAIL_ADDRESS=Decipad<info@yourdomain.com>
MAILERSEND_API_KEY=your_mailersend_api_key
```

**AI Services (optional for basic development):**

```bash
# OpenAI (for AI features)
OPENAI_API_KEY=sk-your_openai_api_key

# Other AI services (optional)
GOOGLE_VERTEX_API_KEY=your_google_vertex_api_key
DEEPINFRA_API_KEY=your_deepinfra_api_key
REPLICATE_API_KEY=your_replicate_api_key
```

#### Development vs Production Keys

- **Use test/development keys** for local development
- **Never use production keys** in development
- **Stripe**: Use `pk_test_` and `sk_test_` keys
- **AWS**: Use a separate development account if possible

#### Minimal Setup for Testing

If you just want to explore the codebase without full functionality:

```bash
# Minimal .env.local for basic exploration
NODE_ENV=development
# CRITICAL: These URLs MUST be set correctly for local development
# These variables should be defined in apps/backend/.env
DECI_APP_URL_BASE=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000/api/auth
JWT_SECRET=development_jwt_secret_change_in_production
AWS_REGION=eu-west-2

# Email configuration (REQUIRED for user login)
DECI_FROM_EMAIL_ADDRESS=Decipad<info@yourdomain.com>
MAILERSEND_API_KEY=your_mailersend_api_key

# Add other variables as needed for specific features you want to test
```

> **Important**: Email configuration is required for user authentication. Without proper email setup, users won't be able to log in to the application.

#### Getting API Keys

**AWS (Required for core functionality):**

1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create IAM user with programmatic access
3. Attach policies: `AmazonS3FullAccess`, `AmazonDynamoDBFullAccess`, `AWSLambdaFullAccess`
4. Create S3 buckets for: pads, pad-backups, attachments, external-data-snapshot

**MailerSend (Required for user authentication):**

1. Sign up at [mailersend.com](https://mailersend.com)
2. Create account and verify your domain
3. Go to API Tokens section
4. Create new token with email sending permissions
5. Use the token as your `MAILERSEND_API_KEY`

**OpenAI (For AI features):**

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create new secret key
4. Add billing information (required for API access)

**Stripe (For payment features):**

1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers > API Keys
3. Use test keys (pk*test* and sk*test*) for development
4. Create test products for extra credits and subscriptions

**Google Services (For Sheets integration):**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Sheets API
4. Create credentials (API key and OAuth 2.0 client)

**Other Services (Optional):**

- **Notion**: [developers.notion.com](https://developers.notion.com) - Create integration
- **Discord**: [discord.com/developers](https://discord.com/developers) - Create application
- **Sentry**: [sentry.io](https://sentry.io) - Create project for error tracking
- **PostHog**: [posthog.com](https://posthog.com) - Create project for analytics

#### Environment Variable Reference

See `.env.example` for a complete list of all available environment variables with descriptions.

#### Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use placeholder values** in examples and documentation
3. **Rotate secrets regularly** in production
4. **Use least-privilege access** for all API keys
5. **Monitor for unauthorized access** to your services

#### Troubleshooting Environment Issues

**Common problems:**

- **Missing variables**: Check `.env.example` for required variables
- **Invalid keys**: Verify API keys are correct and have proper permissions
- **AWS access**: Ensure your AWS credentials have access to required services
- **Port conflicts**: Use `ARC_TABLES_PORT=6000` on macOS

**Debug environment loading:**

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.DECI_APP_URL_BASE)"

# Debug specific modules
DEBUG=@decipad/backend-config yarn start
```

## AWS Configuration

### AWS CLI Setup

To develop locally, you'll need access to a Decipad development AWS account:

1. **Install AWS CLI**:

   ```bash
   # macOS
   brew install awscli

   # Or download from https://aws.amazon.com/cli/
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```
   - Use `eu-west-2` as the default region
   - Enter your AWS Access Key ID and Secret Access Key

### Required AWS Services

The development environment uses the following AWS services:

- **DynamoDB**: For data storage
- **S3**: For file storage
- **Lambda**: For serverless functions
- **API Gateway**: For HTTP endpoints
- **SQS**: For message queues

## Development Server

### Starting the Development Environment

To start both frontend and backend services:

```bash
yarn start
```

This command will:

- Start the backend server on `http://localhost:3333`
- Start the frontend development server on `http://localhost:3000`
- Enable hot reloading for both services

### Individual Services

You can also start services individually:

```bash
# Backend only
yarn serve:backend

# Frontend only
yarn serve:frontend

# Documentation site
yarn serve:docs

# Storybook (UI components)
yarn serve:storybook
```

## Database Configuration

### Local Database Persistence

To persist the database between development sessions:

```bash
export ARC_DB_PATH=/tmp/decipad-db
```

The database will be stored in the specified directory. To clear the database:

```bash
rm -rf /tmp/decipad-db
```

### Database Seeding

The development environment automatically seeds the database with initial data when starting the backend server.

## Port Configuration

### macOS AirPlay Conflict

On newer macOS versions (Monterey+), Apple's AirPlay Receiver uses port 5000, which conflicts with the Architect development server.

To resolve this, set the following environment variable:

```bash
export ARC_TABLES_PORT=6000
```

Add this to your shell configuration file (`.bashrc`, `.zshrc`, etc.) to make it permanent.

## GraphQL Development

### GraphQL Playground

Access the GraphQL playground at `http://localhost:3000/graphql` to:

- Explore the API schema
- Test queries and mutations
- Debug GraphQL operations

### GraphQL Code Generation

When modifying GraphQL schemas or operations:

1. **Build the schema**:

   ```bash
   yarn build:graphql
   ```

2. **Generate TypeScript types**:
   ```bash
   yarn build:graphql:queries
   ```

This generates TypeScript files in `libs/queries` for type-safe GraphQL operations.

### GraphQL Realms

The GraphQL API is organized into realms in `libs/graphqlserver`:

- **Users**: User management and authentication
- **Workspaces**: Workspace and organization management
- **Pads**: Notebook management
- **Permissions**: Access control and roles

## Debugging

### Backend Debugging

Enable debug logging using the `DEBUG` environment variable:

```bash
# All debug logs
DEBUG=@decipad/* yarn start

# Specific modules
DEBUG=@decipad/graphqlserver,@decipad/backend-auth yarn start
```

Key debug modules:

- `@decipad/graphqlserver`: GraphQL server operations
- `@decipad/tables`: Database operations
- `@decipad/backend-auth`: Authentication flows
- `@decipad/backend-search`: Search functionality

### Frontend Debugging

- **React DevTools**: Install browser extension for React debugging
- **Redux DevTools**: For state management debugging
- **Network Tab**: Monitor GraphQL queries and API calls

### Error Tracking

- **Sentry**: Error tracking is configured for production
- **Console Logs**: Check browser console for client-side errors
- **Server Logs**: Monitor terminal output for backend errors

## Testing

### Running Tests

```bash
# All tests
yarn test

# Specific test suites
yarn test:coverage  # With coverage report
yarn e2e           # End-to-end tests
```

### Test Configuration

- **Unit Tests**: Vitest configuration in `vitest.*.config.ts`
- **E2E Tests**: Playwright configuration in `apps/e2e/`
- **Test Utilities**: Helper functions in `libs/testutils/`

## Development Tools

### Code Quality

```bash
# Linting
yarn lint

# Type checking
yarn typecheck

# Formatting
yarn format
```

### Build Commands

```bash
# Build all packages
yarn build

# Build specific packages
yarn build:frontend
yarn build:backend
yarn build:docs

# Watch mode for development
yarn build:backend:watch
```

### Icon Management

Icons are stored in `libs/ui/src/icons/assets` as SVG files:

1. Add new SVG files (use `#000` color for proper inheritance)
2. Build icons into React components:
   ```bash
   nx run ui:build-icons
   ```

## Advanced Features

### Server-Side Rendering (SSR)

Enable SSR for development:

```bash
# Build SSR lambdas
yarn build:backend:ssr

# Start with SSR enabled
yarn serve:all:ssr
```

### External Data Sources

Configure external data connections in the development environment:

- Database connections
- API integrations
- File uploads

### AI Features

AI features require additional configuration:

- OpenAI API key for code assistance
- Proper environment variables for AI services

## Troubleshooting

### Common Issues

1. **Port conflicts**: Use `ARC_TABLES_PORT=6000` for macOS
2. **Memory issues**: Increase Node.js memory limit
3. **Build failures**: Clear cache with `yarn clean`
4. **Database issues**: Reset with `rm -rf /tmp/decipad-db`

### Getting Help

- **Documentation**: Check the main README and docs
- **Issues**: Search existing GitHub issues
- **Discord**: Join the community Discord for help
- **Email**: Contact support@decipad.com

## Performance Optimization

### Development Performance

- **Hot Reloading**: Enabled by default for fast development
- **Incremental Builds**: Nx provides efficient incremental builds
- **Caching**: Yarn and Nx caches speed up subsequent builds

### Memory Management

- **Node.js Memory**: Increase if needed with `NODE_OPTIONS="--max-old-space-size=4096"`
- **Watch Mode**: Use `yarn build:backend:watch` for efficient rebuilding

## Next Steps

After setting up your development environment:

1. **Explore the Codebase**: Start with `docs/CODE_STRUCTURE.md`
2. **Read the Architecture**: Review `docs/ARCHITECTURE.md`
3. **Check Contributing Guidelines**: See `CONTRIBUTING.md`
4. **Join the Community**: Connect with other developers
