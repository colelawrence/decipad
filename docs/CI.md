# Continuous Integration (CI) Setup Guide

This guide provides comprehensive instructions for setting up a local or self-hosted Continuous Integration (CI) environment that mirrors the setup used in our GitHub Actions workflows.

> **New to CI/CD?** We recommend starting with the [Local Setup Guide](LOCAL_SETUP.md) to get your development environment running, then returning here to understand our CI processes.

## Overview

Decipad uses a robust CI/CD pipeline built on GitHub Actions, designed to ensure code quality, run comprehensive tests, and deploy applications reliably. The CI process covers everything from code linting to end-to-end testing and deployment.

## Quick Navigation

- [GitHub Actions Workflows](#github-actions-workflows) - Our CI/CD pipeline overview
- [Local CI Setup](#local-ci-environment-setup) - Replicating CI locally
- [Running CI Steps](#running-ci-steps-locally) - Testing, linting, building
- [Advanced Configuration](#advanced-ci-configuration) - Nx, caching, parallel execution
- [Troubleshooting](#troubleshooting-ci-issues) - Common issues and solutions
- [Performance Optimization](#performance-optimization) - Making CI faster

### CI/CD Stack

- **GitHub Actions**: Primary CI/CD platform
- **Node.js**: Version 24.0.0+ for running the application
- **Yarn**: Package management and dependency resolution
- **Rust & wasm-pack**: WebAssembly compilation for the computation engine
- **Nx**: Monorepo task orchestration and caching
- **AWS CLI**: Cloud service integration
- **Playwright**: End-to-end testing
- **Vitest**: Unit testing framework

## GitHub Actions Workflows

### Main Workflows

#### 1. Test Workflow (`test.yml`)

- **Triggers**: Push to main, pull requests
- **Steps**:
  - Checkout code
  - Setup Node.js and Rust
  - Install dependencies
  - Build WebAssembly modules
  - Run unit tests with coverage
  - Run linting and type checking
  - Build all packages

#### 2. Lint and Typecheck Workflow (`lint-and-typecheck.yml`)

- **Triggers**: Push to main, pull requests
- **Steps**:
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Run ESLint
  - Run TypeScript type checking
  - Run Prettier formatting checks

#### 3. E2E Tests Workflow (`e2e.yml`)

- **Triggers**: Push to main, pull requests
- **Steps**:
  - Checkout code
  - Setup Node.js and Rust
  - Install dependencies
  - Build application
  - Run Playwright E2E tests
  - Upload test results

#### 4. Deployment Workflows

- **Production**: Deploys to production environment
- **Staging**: Deploys to staging environment
- **Preview**: Deploys preview environments for pull requests

## Local CI Environment Setup

### 1. Prerequisites Installation

Install the required software stack:

```bash
# Node.js (version 24.0.0 or higher)
# Download from https://nodejs.org/ or use nvm
nvm install 24.0.0
nvm use 24.0.0

# Yarn package manager
npm install -g yarn

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# wasm-pack for WebAssembly
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# AWS CLI (optional, for deployment testing)
# macOS
brew install awscli
# Or download from https://aws.amazon.com/cli/
```

### 2. Repository Setup

Clone and prepare the repository:

```bash
# Clone the repository
git clone https://github.com/decipad/decipad.git
cd decipad

# Install dependencies
yarn install --ignore-engines

# Verify installation
yarn --version
node --version
rustc --version
wasm-pack --version
```

### 3. Environment Configuration

Set up environment variables for CI testing:

```bash
# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# Set required environment variables
export NODE_ENV=test
export CI=true
export AWS_REGION=eu-west-2
```

### 4. Required Secrets Configuration

Configure the following secrets for full CI functionality:

#### AWS Configuration

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=eu-west-2
```

#### Monitoring and Analytics

```bash
export SENTRY_DSN=your_sentry_dsn
export SENTRY_ORG=your_sentry_org
export SENTRY_PROJECT=your_sentry_project
export SENTRY_AUTH_TOKEN=your_sentry_token
export VITE_ANALYTICS_WRITE_KEY=your_analytics_key
export VITE_POSTHOG_API_KEY=your_posthog_key
```

#### AI Services

```bash
export OPENAI_API_KEY=your_openai_key
export AI_SERVICE_URL=your_ai_service_url
```

#### Email Services

```bash
export MAILERSEND_API_KEY=your_mailersend_key
```

## Running CI Steps Locally

### 1. Code Quality Checks

Run linting and type checking:

```bash
# ESLint linting
yarn lint

# TypeScript type checking
yarn typecheck

# Prettier formatting check
yarn format:check

# All quality checks
yarn lint && yarn typecheck && yarn format:check
```

### 2. Unit Tests

Run the complete test suite:

```bash
# Build backend for testing
yarn build:backend

# Run all unit tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests for affected packages only
npx nx affected --target=test

# Run tests in parallel
npx nx affected --parallel=3 --target=test
```

### 3. Build Verification

Verify that all packages build correctly:

```bash
# Build all packages
yarn build

# Build specific packages
yarn build:frontend
yarn build:backend
yarn build:docs

# Build WebAssembly modules
yarn build:wasm

# Build GraphQL types
yarn build:graphql
```

### 4. End-to-End Tests

Run E2E tests with Playwright:

```bash
# Run E2E tests
yarn e2e

# Run E2E tests in headed mode (for debugging)
yarn e2e --headed

# Run specific E2E test files
yarn e2e --grep "specific test"
```

### 5. Integration Tests

Run integration tests for the backend:

```bash
# Build backend for testing
yarn build:backend

# Run backend integration tests
cd apps/backend
yarn test
```

## Advanced CI Configuration

### 1. Nx Affected Commands

Use Nx's affected commands to run only what's changed:

```bash
# Run tests for affected packages
npx nx affected --target=test

# Run linting for affected packages
npx nx affected --target=lint

# Run builds for affected packages
npx nx affected --target=build

# Show affected projects
npx nx affected:apps
npx nx affected:libs
```

### 2. Parallel Execution

Run tasks in parallel for faster execution:

```bash
# Run tests in parallel
npx nx run-many --target=test --parallel=3

# Run linting in parallel
npx nx run-many --target=lint --parallel=4

# Run builds in parallel
npx nx run-many --target=build --parallel=2
```

### 3. Caching

Leverage Nx caching for faster builds:

```bash
# Show cache status
npx nx show projects

# Clear cache
npx nx reset

# Show cache directory
npx nx show cache
```

## CI Environment Variables

### Required Variables

```bash
# Node.js configuration
NODE_ENV=test
CI=true

# Build configuration
NODE_OPTIONS=--max-old-space-size=4096

# Test configuration
TZ=America/Los_Angeles
```

### Optional Variables

```bash
# Debug configuration
DEBUG=@decipad/*

# Test configuration
VITEST_WORKER_THREADS=4
PLAYWRIGHT_WORKERS=2

# Build optimization
MINIFY=true
```

## Troubleshooting CI Issues

### Common Issues

1. **Memory Issues**:

   ```bash
   # Increase Node.js memory
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Rust Compilation Issues**:

   ```bash
   # Update Rust toolchain
   rustup update

   # Clean Rust cache
   cargo clean
   ```

3. **WebAssembly Build Issues**:

   ```bash
   # Clean wasm-pack cache
   wasm-pack clean

   # Rebuild WebAssembly
   yarn build:wasm
   ```

4. **Test Failures**:

   ```bash
   # Run tests with verbose output
   yarn test --verbose

   # Run specific test files
   yarn test --grep "specific test"
   ```

### Debug Commands

```bash
# Show Nx project graph
npx nx dep-graph

# Show affected projects
npx nx affected:graph

# Show project details
npx nx show project <project-name>

# Show task details
npx nx show task <task-name>
```

## Performance Optimization

### 1. Caching Strategy

- **Nx Cache**: Automatically caches build outputs
- **Yarn Cache**: Caches package downloads
- **Rust Cache**: Caches compilation outputs
- **Node Modules**: Cache `node_modules` directory

### 2. Parallel Execution

- Use `--parallel` flag for independent tasks
- Configure appropriate worker counts
- Balance CPU usage with memory consumption

### 3. Incremental Builds

- Use `nx affected` commands
- Leverage Nx's dependency graph
- Cache build outputs between runs

## Monitoring and Reporting

### 1. Test Coverage

```bash
# Generate coverage report
yarn test:coverage

# View coverage in browser
open coverage/index.html
```

### 2. Performance Metrics

```bash
# Run performance tests
yarn test:performance

# Upload performance results
yarn upload-performance-results
```

### 3. Build Analysis

```bash
# Analyze bundle size
yarn build:analyze

# Show dependency graph
npx nx dep-graph
```

## Best Practices

### 1. CI Pipeline Design

- Run fast checks first (linting, type checking)
- Use parallel execution where possible
- Cache build outputs and dependencies
- Fail fast on critical issues

### 2. Test Strategy

- Unit tests for individual components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for key metrics

### 3. Environment Management

- Use consistent Node.js versions
- Pin dependency versions
- Separate test and production environments
- Use environment-specific configurations

### 4. Error Handling

- Provide clear error messages
- Include debugging information
- Use appropriate exit codes
- Log relevant context

## Getting Help

### Resources

- **Nx Documentation**: [nx.dev](https://nx.dev)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Playwright**: [playwright.dev](https://playwright.dev)
- **Vitest**: [vitest.dev](https://vitest.dev)

### Support

- **GitHub Issues**: Report CI-related issues
- **Discord Community**: Get help from other developers
- **Documentation**: Check this guide and other docs
- **Email Support**: Contact support@decipad.com
