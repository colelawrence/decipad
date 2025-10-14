<p align="center">
  <img src="https://user-images.githubusercontent.com/12210180/162798827-fd60eab3-907c-4ca1-a0dc-12ef34acb518.png" width="50">
</p>

<h2 align="center">Decipad — Make sense of numbers</h2>

## Single command to get codebase running with tilt

[Install mise](https://mise.jdx.dev/installing-mise.html) and run the full development environment:

```
# Run the full development environment
mise trust
# Mise uses .env.demo for environment variables, so no env changes necessary
mise run tilt
```

<p align="center">
  <strong>The open-source quantitative modeling and data notebook.</strong>
  <br />
  <br />
  <a href="https://github.com/decipad/decipad/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Decipad is released under the MIT license." />
  </a>
  <a href="https://github.com/decipad/decipad/actions/workflows/test.yml">
    <img src="https://github.com/decipad/decipad/actions/workflows/test.yml/badge.svg" alt="Run Tests" />
  </a>
  <a href="https://github.com/decipad/decipad/actions/workflows/lint-and-typecheck.yml">
    <img src="https://github.com/decipad/decipad/actions/workflows/lint-and-typecheck.yml/badge.svg" alt="Lint & Typecheck" />
  </a>
</p>

Decipad is a low-code notebook that helps you gather data, build interactive models, and share reports. This repository contains the source code for the Decipad application.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Security](#security)
  - [Environment Variables](#environment-variables)
  - [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Important Scripts](#important-scripts)
- [Deployment](#deployment)
- [Continuous Integration](#continuous-integration)
- [Community](#community)
- [License](#license)

## Getting Started

Follow these instructions to get Decipad running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, you only need to install **mise** - it will handle all other dependencies automatically:

- **mise**: A development tool version manager. Install it with:
  ```bash
  curl https://mise.run | sh
  # or: brew install mise
  ```

That's it! mise will install Node.js, Rust, wasm-pack, Tilt, and other required tools automatically.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/decipad/decipad.git
    cd decipad
    ```

2.  **Trust and install tools:**

    ```bash
    mise trust
    mise install    # Installs Node.js, Rust, Yarn, wasm-pack, Tilt, etc.
    ```

3.  **Set up environment variables:**
    ```bash
    cp .env.example .env.local
    # Create backend environment file
    touch apps/backend/.env
    # Edit .env.local with your actual API keys and secrets
    # IMPORTANT: Set NEXTAUTH_URL to http://localhost:3000/api/auth and DECI_APP_URL_BASE to http://localhost:3000 in apps/backend/.env
    ```

### Running the Application

To start the full development environment with automatic WASM rebuild, frontend, and backend servers:

```bash
mise run tilt
```

This starts Tilt, which orchestrates all development services. A browser window will open showing the Tilt dashboard where you can monitor all services.

Alternatively, you can use the old method:

```bash
yarn start
```

This will start the development servers, and a browser window should automatically open with the application.

## Security

### Environment Variables

This project uses environment variables for all sensitive configuration. **Never commit real API keys or secrets to the repository.**

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys and secrets
3. Never commit `.env.local` or any file containing real secrets

See [SECURITY.md](SECURITY.md) for detailed security information and best practices.

### Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [security@decipad.com](mailto:security@decipad.com)
3. We will respond within 48 hours

## Development

This project is a monorepo managed with Nx. All applications and libraries are located in the `apps` and `libs` directories, respectively.

### Project Structure

- `apps/`: Contains the main applications, such as the frontend and backend.
- `libs/`: Contains shared libraries and modules used across different applications.

### Important Scripts

Here are some of the most common scripts you'll use during development:

**Using mise (recommended):**

```bash
# Start full dev environment (recommended)
mise run tilt         # or: tilt up
mise run tilt:down    # Stop all resources

# Manual development (if not using Tilt)
mise run serve:backend   # Backend server only
mise run serve:frontend  # Frontend dev server only
mise run wasm:watch      # Auto-rebuild WASM on changes

# Building
mise run build           # Build all packages
mise run build:frontend  # Build frontend only
mise run build:backend   # Build backend only
mise run build:wasm      # Build WASM only

# Type checking & testing
mise run typecheck       # Check TypeScript types
mise run test            # Run all tests
mise run test:coverage   # Run tests with coverage
mise run e2e             # Run end-to-end tests

# Linting & formatting
mise run lint            # Lint all files
mise run lint:fix        # Lint and auto-fix
mise run format          # Format code
mise run format:check    # Check formatting

# Cleaning
mise run clean           # Clean build artifacts
mise run clean:all       # Clean everything including deps
```

**Using yarn (original):**

```bash
yarn test       # Run tests
yarn lint       # Lint files
yarn format     # Format code
yarn build      # Build all packages
```

For more advanced commands and to leverage the full power of Nx, please refer to the [official Nx documentation](https://nx.dev/l/r/getting-started/nx-cli).

### Advanced Local Setup

For detailed instructions on setting up a local development environment, including AWS configuration, environment variables, and debugging, please see our [Local Setup Guide](docs/LOCAL_SETUP.md).

## Deployment

For instructions on how to deploy the application to AWS, please refer to our [Deployment Guide](docs/DEPLOYMENT.md).

## Continuous Integration

For instructions on how to set up a CI environment similar to our GitHub Actions workflows, please see our [CI Setup Guide](docs/CI.md).

## Community

We welcome contributions from the community! If you're interested in contributing, please take a look at our contributing guidelines (coming soon).

All members of our community are expected to follow our [Code of Conduct](docs/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
