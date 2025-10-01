# Code Structure

This document provides a comprehensive overview of the Decipad codebase structure, organized as a monorepo using Nx for efficient development and build processes.

> **New to the codebase?** We recommend reading the [Architecture Guide](ARCHITECTURE.md) first to understand the overall system, then use this document to navigate the code.

## Quick Navigation

- [Applications](#applications-apps) - Main applications (frontend, backend, docs, e2e)
- [Frontend Libraries](#frontend-libraries) - UI components, editor, and client-side code
- [Backend Libraries](#backend-libraries) - Server-side services and infrastructure
- [Shared Libraries](#shared-libraries) - Common utilities and language components
- [Build & Development](#build-and-development) - Configuration and scripts
- [Architectural Patterns](#key-architectural-patterns) - Design principles and patterns

## Repository Organization

The repository is organized into two main directories:

- **`apps/`**: Independent applications that can be built and deployed separately
- **`libs/`**: Shared libraries and modules used across different applications

> **Tip**: Use `npx nx dep-graph` to visualize the dependency relationships between packages.

## Applications (`apps/`)

### `apps/backend/`

The serverless backend application deployed to AWS using the Architect framework.

- **`app.arc`**: Architect descriptor defining the entire backend infrastructure
- **`tests/`**: Integration tests for the backend API
- **`scripts/`**: Local development sandbox scripts and utilities
- **`src/`**: Bundled lambda functions compiled from `libs/lambdas`

### `apps/frontend/`

The main React application providing the user interface.

- **Routing**: React Router for client-side navigation
- **State Management**: Context providers and custom hooks
- **GraphQL Integration**: urql client for data fetching
- **Authentication**: User authentication and session management
- **Styling**: Emotion CSS-in-JS and Tailwind CSS

### `apps/docs/`

Docusaurus-based documentation website.

- **User Documentation**: Comprehensive guides and tutorials
- **API Reference**: Documentation for the Decipad language and APIs
- **Blog**: Release notes and feature announcements

### `apps/e2e/`

End-to-end tests using Playwright.

- **Test Suites**: Comprehensive E2E test coverage
- **Test Utilities**: Helper functions and test data
- **CI Integration**: Automated testing in GitHub Actions

## Libraries (`libs/`)

### Frontend Libraries

#### Core UI and Components

- **`libs/ui/`**: Comprehensive component library implementing the design system
- **`libs/editor/`**: Core editor functionality and Slate integration
- **`libs/editor-*`**: Specialized editor packages:
  - `editor-components/`: Reusable editor components
  - `editor-plugins/`: Editor plugin system
  - `editor-table/`: Table editing functionality
  - `editor-hooks/`: Custom React hooks for editor functionality
  - `editor-ai-assistant/`: AI integration components

#### Notebook and State Management

- **`libs/notebook/`**: Core notebook functionality
- **`libs/notebook-*`**: Specialized notebook packages:
  - `notebook-state/`: Notebook state management
  - `notebook-tabs/`: Tab management system
  - `notebook-maintenance/`: Notebook maintenance utilities

#### Language and Computation

- **`libs/computer/`**: Language runtime bridge between editor and computation engine
- **`libs/language/`**: Core Decipad language parser and evaluator
- **`libs/language-*`**: Specialized language packages:
  - `language-types/`: Type definitions and validation
  - `language-units/`: Unit system and conversions
  - `language-builtins/`: Built-in functions and operators
  - `language-filters/`: Data filtering operations
  - `language-aggregations/`: Data aggregation functions

#### Data and Integrations

- **`libs/externaldata/`**: External data source management
- **`libs/import/`**: Data import and processing utilities
- **`libs/export/`**: Data export functionality

#### Client-Side Utilities

- **`libs/client-*`**: Client-side utilities:
  - `client-cache/`: Caching mechanisms
  - `client-config/`: Configuration management
  - `client-events/`: Event handling system
- **`libs/react-*`**: React-specific utilities:
  - `react-contexts/`: React context providers
  - `react-utils/`: React utility functions

### Backend Libraries

#### Core Backend Services

- **`libs/lambdas/`**: Individual Lambda functions for AWS deployment
  - `src/auth-flow/`: Authentication API (NextAuth.js integration)
  - `src/http/`: HTTP API implementations
  - `src/queues/`: Queue processing functions
  - `src/ws/`: WebSocket event handlers
- **`libs/graphqlserver/`**: GraphQL server implementation with realm-based organization
- **`libs/graphqlresource/`**: Resource abstraction layer for GraphQL operations
- **`libs/backendtypes/`**: TypeScript types for database access and GraphQL resolvers

#### AI and Machine Learning

- **`libs/backend-code-assistant/`**: AI service for code generation and assistance
- **`libs/backend-notebook-assistant/`**: AI service for notebook assistance and chat

#### Data and Storage

- **`libs/backend-data-lake/`**: Data lake functionality and management
- **`libs/backend-external-db/`**: External database integration
- **`libs/backend-resources/`**: Resource management utilities

#### Infrastructure and Utilities

- **`libs/backend-*`**: Backend utility packages:
  - `backend-analytics/`: Event tracking and analytics
  - `backend-trace/`: Error tracking and performance monitoring
  - `backend-config/`: Configuration management
  - `backend-utils/`: General backend utilities
- **`libs/services/`**: Infrastructure service abstractions
- **`libs/tables/`**: DynamoDB table wrapper with TypeScript types
- **`libs/dynamodb-lock/`**: Distributed locking for DynamoDB operations

#### Real-time Collaboration

- **`libs/slate-yjs/`**: Integration between Slate editor and Y.js
- **`libs/y-dynamodb/`**: Backend persistence for Y.js operations
- **`libs/y-lambdawebsocket/`**: WebSocket communication for real-time sync
- **`libs/y-indexeddb/`**: Local storage for offline editing
- **`libs/sync-connection-lambdas/`**: WebSocket connection management

#### Communication and Messaging

- **`libs/emails/`**: Email template system
- **`libs/discord-customerservice-lambda/`**: Discord integration for customer support
- **`libs/message-packer/`**: Message serialization utilities

### Shared Libraries

#### Language and Parsing

- **`libs/parse/`**: General parsing utilities
- **`libs/language-interfaces/`**: Language interface definitions
- **`libs/language-utils/`**: Language utility functions

#### Data Processing

- **`libs/number/`**: Number handling and formatting
- **`libs/fraction/`**: Fraction arithmetic
- **`libs/format/`**: Data formatting utilities
- **`libs/universal-compare/`**: Universal comparison functions

#### UI and Interaction

- **`libs/column/`**: Column data handling
- **`libs/toast/`**: Toast notification system
- **`libs/dom-test-utils/`**: DOM testing utilities

#### Development and Testing

- **`libs/testutils/`**: Testing utilities and helpers
- **`libs/eslint-*`**: ESLint configuration and plugins
- **`libs/generator-utils/`**: Code generation utilities

#### Utilities and Helpers

- **`libs/utils/`**: General utility functions
- **`libs/fetch/`**: HTTP client utilities
- **`libs/retry/`**: Retry logic and error handling
- **`libs/fnqueue/`**: Function queue management
- **`libs/listener-helper/`**: Event listener utilities
- **`libs/postmessage-rpc/`**: PostMessage RPC communication
- **`libs/super-buffer/`**: Buffer utilities

#### Configuration and Environment

- **`libs/shared-config/`**: Shared configuration management
- **`libs/feature-flags/`**: Feature flag system
- **`libs/meta/`**: Metadata management

#### Initial Data

- **`libs/initial-workspace/`**: Default notebooks for new workspaces

## Build and Development

### Nx Configuration

- **`nx.json`**: Nx workspace configuration
- **`tsconfig.json`**: TypeScript configuration
- **`package.json`**: Dependencies and scripts

### Build Tools

- **`vite.config.ts`**: Vite configuration for frontend builds
- **`vitest.*.config.ts`**: Vitest configuration for testing
- **`tailwind.config.js`**: Tailwind CSS configuration
- **`postcss.config.js`**: PostCSS configuration

### Development Scripts

- **`scripts/`**: Build, deployment, and utility scripts
- **`patches/`**: Package patches for dependencies

## Key Architectural Patterns

### Monorepo Structure

- **Nx Workspace**: Efficient build and dependency management
- **Shared Libraries**: Reusable code across applications
- **Independent Applications**: Separate deployment units

### Frontend Architecture

- **Component Library**: Centralized UI components
- **Editor System**: Pluggable editor architecture
- **State Management**: Context-based state management
- **Real-time Sync**: Y.js-based collaboration

### Backend Architecture

- **Serverless Functions**: AWS Lambda-based backend
- **GraphQL API**: Type-safe API with real-time subscriptions
- **Database Layer**: DynamoDB with comprehensive indexing
- **AI Integration**: OpenAI and other AI service integrations

### Language System

- **Rust Backend**: High-performance computation engine
- **WebAssembly**: Browser-based execution
- **Custom Parser**: Nearley-based grammar parsing
- **Real-time Evaluation**: Live computation as users type
