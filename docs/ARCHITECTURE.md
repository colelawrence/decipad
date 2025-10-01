# System Architecture

This document provides a comprehensive overview of the Decipad system architecture, covering the frontend, backend, document synchronization, computation engine, AI features, and data integrations.

> **Getting Started?** If you're new to Decipad development, we recommend starting with the [Local Setup Guide](LOCAL_SETUP.md) and then returning here to understand the system architecture.

## Overview

Decipad is a low-code data notebook platform that combines mathematical expressions, interactive widgets, and AI assistance to help users gather data, build interactive models, and share reports. The system is built as a modern web application with real-time collaboration capabilities.

## Quick Navigation

- [Frontend](#frontend) - React application and UI components
- [Backend](#backend) - Serverless AWS infrastructure
- [Document Synchronization](#document-synchronization) - Real-time collaboration
- [Computation Engine](#computation-engine) - Rust-based language runtime
- [AI Integration](#ai-integration) - AI-powered features
- [Data Integrations](#data-integrations) - External data sources
- [Security](#security-and-authentication) - Authentication and permissions
- [Performance](#performance-and-scalability) - Optimization strategies

## Frontend

The frontend is a modern web application built with React and TypeScript, providing an intuitive interface for creating and managing data notebooks.

### Key Libraries and Frameworks

- **React 18**: For building the user interface with modern React features
- **TypeScript**: For type safety and better developer experience
- **Nx**: For managing the monorepo and running tasks efficiently
- **Emotion**: For CSS-in-JS styling with theme support
- **Slate**: For the rich text editor that forms the core of the notebook experience
- **urql**: For GraphQL client-side data fetching and caching
- **Framer Motion**: For smooth animations and transitions
- **Radix UI**: For accessible UI components
- **Tailwind CSS**: For utility-first styling

### Structure

The frontend is organized into several key packages:

- `apps/frontend`: The main application handling routing, authentication, and page structure
- `apps/docs`: Docusaurus-based documentation website
- `apps/e2e`: End-to-end tests using Playwright
- `libs/ui`: Comprehensive component library implementing the design system
- `libs/editor*`: Collection of packages managing document editing and viewing
- `libs/notebook*`: Notebook-specific functionality and state management
- `libs/computer`: Language runtime bridge between editor and computation engine

## Backend

The backend is built on a serverless architecture using AWS Lambda and the Architect framework, providing scalability and cost-effectiveness.

### Key Technologies

- **AWS Lambda**: For running serverless functions with Node.js 18.x runtime
- **Architect**: For defining and deploying serverless infrastructure as code
- **DynamoDB**: For the primary database with comprehensive indexing
- **S3**: For file storage and static assets
- **GraphQL**: For the primary API with real-time subscriptions
- **WebSockets**: For real-time collaboration and live updates
- **OpenSearch**: For search functionality across notebooks and content

### Infrastructure as Code

The entire backend infrastructure is defined in `apps/backend/app.arc`, including:

- Lambda functions for HTTP APIs, WebSocket connections, and background processing
- DynamoDB tables for users, workspaces, notebooks, permissions, and more
- S3 buckets for file storage and static hosting
- API Gateway for HTTP endpoints
- SQS queues for background job processing

### Core Services

- **Authentication**: NextAuth.js integration with multiple providers
- **Permissions**: Role-based access control for workspaces and notebooks
- **File Management**: Upload, storage, and retrieval of attachments
- **External Data Sources**: Integration with databases and APIs
- **AI Services**: Code and notebook assistance using OpenAI and other providers
- **Search**: Full-text search across notebooks and content
- **Analytics**: Event tracking and user behavior analysis

## Document Synchronization

Decipad uses a Conflict-free Replicated Data Type (CRDT) approach based on Y.js for real-time collaboration and offline editing.

### How it Works

1. **Local Changes**: User edits are converted into Y.js operations
2. **Local Storage**: Operations are saved locally in IndexedDB for offline access
3. **Server Sync**: Operations are sent to the server via WebSockets
4. **Broadcast**: Server processes operations, stores in DynamoDB, and broadcasts to connected clients
5. **Convergence**: All clients eventually converge to the same document state

### Synchronization Components

- `libs/slate-yjs`: Integration between Slate editor and Y.js
- `libs/y-dynamodb`: Backend persistence for Y.js operations
- `libs/y-lambdawebsocket`: WebSocket communication for real-time sync
- `libs/y-indexeddb`: Local storage for offline editing

## Computation Engine

The computation engine is responsible for parsing and executing the Decipad language formulas within notebooks.

### Language Features

- **Mathematical Expressions**: Support for complex mathematical operations
- **Units and Dimensional Analysis**: Built-in unit conversion and dimensional transparency
- **Functions**: User-defined functions with parameters
- **Tables**: Structured data with column operations
- **Conditional Logic**: If-then-else expressions
- **Tiered Calculations**: Complex tiered computation structures
- **Array Operations**: Dimensional transparency for array operations

### Implementation

- **Rust Backend**: Core computation engine written in Rust
- **WebAssembly**: Compiled to WASM for efficient browser execution
- **Custom Grammar**: Nearley-based parser for the Decipad language
- **Real-time Evaluation**: Live computation as users type
- **Error Handling**: Comprehensive error reporting and validation

### Language Components

- `libs/language`: Core language parser and evaluator
- `libs/language-*`: Specialized language modules (types, units, builtins, etc.)
- `libs/computer`: Frontend bridge to the computation engine
- `apps/compute-backend`: Rust-based computation backend

## AI Integration

Decipad includes comprehensive AI features to assist users in data analysis and model building.

### AI Features

- **Notebook Chat Assistant**: Interactive AI chat for brainstorming and guidance
- **Code Generation**: AI-assisted creation of Decipad language code
- **Content Rewriting**: AI-powered text improvement and suggestions
- **Data Generation**: AI-generated data for populating tables and models
- **Smart Suggestions**: Context-aware recommendations for next steps

### AI Components

- `libs/backend-code-assistant`: AI service for code generation
- `libs/backend-notebook-assistant`: AI service for notebook assistance
- `libs/editor-ai-assistant`: Frontend AI integration components

## Data Integrations

Decipad supports various data sources and integrations for importing and analyzing external data.

### Supported Integrations

- **Databases**: MySQL, PostgreSQL, BigQuery, and other SQL databases
- **APIs**: REST API integrations with authentication
- **Files**: CSV, Excel, and other data file formats
- **External Services**: Notion, Google Sheets, and other platforms

### Integration Components

- `libs/externaldata`: Data source management and configuration
- `libs/external-data-lambdas`: Backend services for data fetching
- `libs/backend-external-db`: Database connection management
- `libs/import`: Data import and processing utilities

## Security and Authentication

### Authentication Methods

- **OAuth Providers**: Google, GitHub, and other OAuth providers
- **Email Verification**: Secure email-based account verification
- **API Keys**: Programmatic access with secure key management

### Security Features

- **Encryption**: Sensitive data encrypted at rest and in transit
- **Permissions**: Granular role-based access control
- **Audit Logging**: Comprehensive logging of user actions
- **Rate Limiting**: Protection against abuse and overuse

## Performance and Scalability

### Frontend Optimization

- **Code Splitting**: Lazy loading of components and features
- **Caching**: Intelligent caching of GraphQL queries and static assets
- **Bundle Optimization**: Tree shaking and minimal bundle sizes
- **Progressive Web App**: Offline capabilities and app-like experience

### Backend Scalability

- **Serverless Architecture**: Auto-scaling based on demand
- **Database Optimization**: Efficient indexing and query patterns
- **CDN Integration**: Global content delivery for static assets
- **Caching Layers**: Multiple caching strategies for optimal performance

## Monitoring and Observability

### Error Tracking

- **Sentry Integration**: Comprehensive error tracking and performance monitoring
- **Custom Analytics**: User behavior and feature usage tracking
- **Log Aggregation**: Centralized logging for debugging and analysis

### Performance Monitoring

- **Web Vitals**: Core web vitals tracking for user experience
- **API Performance**: Backend response time and throughput monitoring
- **Real-time Metrics**: Live performance dashboards and alerts
