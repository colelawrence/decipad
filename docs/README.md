# Decipad Documentation

Welcome to the comprehensive documentation for Decipad, the open-source data notebook platform. This documentation is designed for developers, contributors, and users who want to understand, contribute to, or deploy Decipad.

## What is Decipad?

Decipad is a low-code data notebook platform that combines mathematical expressions, interactive widgets, and AI assistance to help users gather data, build interactive models, and share reports. Built with modern web technologies, Decipad provides a powerful yet accessible platform for data analysis and visualization.

### Key Features

- **Mathematical Expressions**: Powerful Decipad language for complex calculations
- **Interactive Widgets**: Sliders, charts, and tables for data exploration
- **Real-time Collaboration**: Multi-user editing with conflict-free synchronization
- **AI Assistance**: AI-powered code generation and content suggestions
- **Data Integrations**: Connect to databases, APIs, and external data sources
- **WebAssembly Engine**: High-performance computation engine written in Rust
- **Modern UI**: Built with React, TypeScript, and modern web standards

## Table of Contents

### Getting Started

- **[Local Setup](LOCAL_SETUP.md)** - Complete guide for setting up a local development environment
- **[Deployment Guide](DEPLOYMENT.md)** - Instructions for deploying Decipad to AWS
- **[CI Setup Guide](CI.md)** - Setting up continuous integration and testing

### Architecture & Development

- **[System Architecture](ARCHITECTURE.md)** - Comprehensive overview of Decipad's architecture
- **[Code Structure](CODE_STRUCTURE.md)** - Detailed breakdown of the codebase organization

### Contributing

- **[Contributor Guidelines](../CONTRIBUTING.md)** - How to contribute to Decipad
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines and standards

## Documentation Map

Understanding how our documentation fits together:

**Documentation Flow:**

1. **Start Here** → [README.md](README.md) (this file)
2. **Get Running** → [Local Setup Guide](LOCAL_SETUP.md)
3. **Understand System** → [Architecture Guide](ARCHITECTURE.md)
4. **Navigate Code** → [Code Structure](CODE_STRUCTURE.md)
5. **Start Contributing** → [Contributing Guidelines](../CONTRIBUTING.md)
6. **Deploy Changes** → [Deployment Guide](DEPLOYMENT.md)

**Quick Reference:**

- **New to Decipad?** → Start with [New Developer Guide](#new-developer-guide)
- **Setting up locally?** → [Local Setup Guide](LOCAL_SETUP.md)
- **Understanding the code?** → [Architecture Guide](ARCHITECTURE.md) → [Code Structure](CODE_STRUCTURE.md)
- **Ready to contribute?** → [Contributing Guidelines](../CONTRIBUTING.md)
- **Need to deploy?** → [Deployment Guide](DEPLOYMENT.md)
- **Having issues?** → [Troubleshooting](#troubleshooting)

## Quick Start

### For Users

1. Visit [app.decipad.com](https://app.decipad.com) to start using Decipad
2. Create a new notebook and explore the features
3. Check out our [user documentation](https://docs.decipad.com) for tutorials

### For Developers

1. **Start Here**: Follow the [Local Setup Guide](LOCAL_SETUP.md) to get your development environment running
2. **Understand the System**: Read the [Architecture Guide](ARCHITECTURE.md) to understand how Decipad works
3. **Explore the Code**: Check the [Code Structure](CODE_STRUCTURE.md) to navigate the codebase
4. **Start Contributing**: Read the [Contributing Guidelines](../CONTRIBUTING.md) to begin contributing

### For Contributors

1. **Fork & Clone**: Fork the repository on GitHub and clone your fork
2. **Setup Environment**: Follow the [Local Setup Guide](LOCAL_SETUP.md) to get everything running
3. **Read Guidelines**: Study the [Contributing Guidelines](../CONTRIBUTING.md) for best practices
4. **Find Issues**: Look for issues labeled `good first issue` or `help wanted`
5. **Join Community**: Connect with other developers in our Discord community

## New Developer Guide

If you're new to Decipad development, follow this step-by-step guide:

### Step 1: Prerequisites

- Install [Node.js 18.16.0+](https://nodejs.org/)
- Install [Yarn](https://yarnpkg.com/getting-started/install)
- Install [Rust](https://rustup.rs/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- Install [Git](https://git-scm.com/downloads)

### Step 2: Get the Code

```bash
git clone https://github.com/decipad/decipad.git
cd decipad
yarn install
```

### Step 3: Set Up Environment

```bash
cp .env.example .env
# Create backend environment file
touch apps/backend/.env
# Edit .env files with your configuration
# IMPORTANT: Set NEXTAUTH_URL and DECI_APP_URL_BASE to http://localhost:3000 in apps/backend/.env
```

### Step 4: Start Development

```bash
yarn start
# This starts both frontend (localhost:3000) and backend (localhost:3333)
```

### Step 5: Learn the Codebase

- **Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- **Code Organization**: Study [CODE_STRUCTURE.md](CODE_STRUCTURE.md) to navigate the code
- **Development Workflow**: Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for best practices

### Step 6: Make Your First Contribution

- Find an issue labeled `good first issue`
- Create a new branch: `git checkout -b feature/your-feature`
- Make your changes and test them
- Submit a pull request

### Need Help?

- **Documentation**: Check the relevant docs linked above
- **Issues**: Search [GitHub Issues](https://github.com/decipad/decipad/issues)
- **Community**: Join our Discord for real-time help
- **Email**: Contact support@decipad.com

## Common Tasks

### I want to...

- **Set up my development environment** → [Local Setup Guide](LOCAL_SETUP.md)
- **Understand how Decipad works** → [Architecture Guide](ARCHITECTURE.md)
- **Navigate the codebase** → [Code Structure](CODE_STRUCTURE.md)
- **Deploy to AWS** → [Deployment Guide](DEPLOYMENT.md)
- **Set up CI/CD** → [CI Setup Guide](CI.md)
- **Contribute code** → [Contributing Guidelines](../CONTRIBUTING.md)
- **Report a bug** → [GitHub Issues](https://github.com/decipad/decipad/issues)
- **Request a feature** → [GitHub Discussions](https://github.com/decipad/decipad/discussions)
- **Get help from the community** → [Discord](https://discord.gg/decipad)

### Quick Commands

```bash
# Start development
yarn start

# Run tests
yarn test

# Build everything
yarn build

# Deploy to development
yarn deploy

# Check code quality
yarn lint && yarn typecheck
```

## Technology Stack

### Frontend

- **React 18** - User interface framework
- **TypeScript** - Type-safe JavaScript
- **Emotion** - CSS-in-JS styling
- **Slate** - Rich text editor
- **urql** - GraphQL client
- **Tailwind CSS** - Utility-first CSS

### Backend

- **AWS Lambda** - Serverless functions
- **Architect** - Serverless framework
- **DynamoDB** - NoSQL database
- **GraphQL** - API layer
- **WebSockets** - Real-time communication

### Language & Computation

- **Rust** - Computation engine
- **WebAssembly** - Browser execution
- **Nearley** - Grammar parsing
- **Y.js** - Real-time collaboration

### Development Tools

- **Nx** - Monorepo management
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Community

### Getting Help

- **Documentation**: This comprehensive guide
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community chat and support
- **Email**: support@decipad.com

### Contributing

We welcome contributions from developers of all skill levels! See our [Contributing Guidelines](../CONTRIBUTING.md) for details.

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Decipad is released under the MIT License. See the [LICENSE](../LICENSE) file for details.

## Troubleshooting

### Common Issues

**"yarn install" fails**

- Make sure you have Node.js 18.16.0+ installed
- Try clearing cache: `yarn cache clean`
- Delete `node_modules` and try again: `rm -rf node_modules && yarn install`

**"yarn start" doesn't work**

- Check that all dependencies are installed: `yarn install`
- Verify your environment variables are set up correctly
- Check the [Local Setup Guide](LOCAL_SETUP.md) for detailed troubleshooting

**Build errors**

- Run `yarn lint` and `yarn typecheck` to identify issues
- Make sure Rust is installed for WebAssembly compilation
- Check the [CI Guide](CI.md) for build troubleshooting

**Can't connect to AWS**

- Verify your AWS credentials are configured: `aws configure`
- Check that you have the required permissions
- See the [Deployment Guide](DEPLOYMENT.md) for AWS setup

### Getting Help

- **Documentation**: Check the relevant guides linked above
- **GitHub Issues**: Search existing issues or create a new one
- **Discord**: Join our community for real-time help
- **Email**: Contact support@decipad.com for support

## Support

- **Documentation**: [docs.decipad.com](https://docs.decipad.com)
- **GitHub**: [github.com/decipad/decipad](https://github.com/decipad/decipad)
- **Email**: support@decipad.com
- **Discord**: Join our community Discord

---

Thank you for your interest in Decipad! We're excited to have you as part of our community. 🎉
