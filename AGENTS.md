# Agent Instructions for Decipad

This file contains instructions and context for AI coding agents working on the Decipad codebase.

## Quick Start

This project uses **mise** for tool management and **Tilt** for orchestrating the development environment.

```bash
# Start the full development environment
mise run tilt

# Stop Tilt
mise run tilt:down
```

## Project Structure

This is a monorepo managed with Nx:

- `apps/backend` - Backend server (Node.js with Apollo GraphQL)
- `apps/frontend` - Frontend application (React with Vite)
- `apps/docs` - Documentation site
- `apps/compute-backend` - Rust WASM compute module
- `libs/` - Shared libraries and modules
- `libs/compute-backend-js` - JavaScript wrapper for WASM
- `libs/language` - Nearley grammar for Decipad language
- `libs/ui` - Shared UI components (Storybook)

## Common Commands

### Development

```bash
mise run tilt              # Start full dev environment (recommended)
mise run tilt:down         # Stop Tilt

# Or run services individually:
mise run serve:backend     # Backend on http://localhost:3333
mise run serve:frontend    # Frontend on http://localhost:3000
mise run serve:storybook   # Storybook on http://localhost:4400
mise run serve:docs        # Docs on http://localhost:4200
```

### Building

```bash
mise run build             # Build everything
mise run build:wasm        # Build WASM module
mise run build:backend     # Build backend
mise run build:frontend    # Build frontend
mise run build:grammar     # Build Nearley grammar
mise run build:graphql     # Generate GraphQL types
```

### Type Checking & Testing

```bash
mise run typecheck         # Type check all TypeScript
mise run test              # Run all tests
mise run test:coverage     # Run tests with coverage
mise run e2e               # Run end-to-end tests
```

### Linting & Formatting

```bash
mise run lint              # Lint all files
mise run lint:fix          # Lint and auto-fix issues
mise run format            # Format code with Prettier
mise run format:check      # Check formatting
```

### Cleaning

```bash
mise run clean             # Clean build artifacts
mise run clean:deps        # Remove node_modules
mise run clean:all         # Clean everything
```

## Important Notes

### WASM Build

The project includes a Rust WASM compute backend that must be built before running the application:

- Located in `apps/compute-backend`
- Outputs to `libs/compute-backend-js/src/wasm`
- Built automatically by `postinstall` script
- Can be manually rebuilt with `mise run build:wasm`

### GraphQL

The project uses GraphQL code generation:

- Schema defined in backend
- Types generated with `mise run build:graphql`
- Backend-specific types: `mise run build:backend:graphql`

### Grammar

The Decipad language uses Nearley for parsing:

- Grammar source: `libs/language/src/grammar/nearley/*.ne`
- Generated output: `deci-language-grammar-generated.js`
- Build with: `mise run build:grammar`

## Nx Monorepo

This project uses Nx for monorepo management. Key concepts:

- **Projects**: Apps and libraries in `apps/` and `libs/`
- **Targets**: Common operations like `serve`, `build`, `test`, `lint`
- **Dependencies**: Nx understands project dependencies and builds in correct order

You can use Nx commands directly:
```bash
nx serve backend
nx build frontend
nx run-many --target=test --all
```

## Environment Variables

Required environment files:
- `.env.local` - Frontend environment variables
- `apps/backend/.env` - Backend environment variables (optional for development)

See `.env.example` for template.

### Email in Development

In development mode (when `ARC_ENV !== 'production'`), magic link authentication emails are **not sent**. Instead, the validation links are logged to the console:

```
validation link:
http://localhost:3000/validate?token=...
```

Look for these links in the backend server output when signing up or logging in. The links appear in:
- Email provider: `libs/backend-auth/src/providers/email.ts` (lines 99-102)
- Invites: `libs/services/src/invites/create.ts` (lines 79-82)

## Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Follow existing patterns in the codebase
- Use shared libraries from `libs/` when possible

## Testing

- Unit tests: Vitest
- E2E tests: Playwright
- Tests run in `TZ=America/Los_Angeles` timezone
- Backend must be built before running tests

## Common Issues

1. **WASM build fails**: Ensure Rust and wasm-pack are installed (`mise install`)
2. **Port conflicts**: Check if ports 3000 (frontend), 3333 (backend), 4400 (storybook), 4568 (s3rver) are available
3. **Node version**: Project requires Node.js 24 (automatically installed by mise)
4. **Yarn vs npm**: This project uses Yarn for package management
5. **AWS SSO credentials expired**: If you see "Token is expired. To refresh this SSO session run 'aws sso login'", you can either:
   - Run `aws sso login` to refresh your credentials
   - Unset AWS_PROFILE temporarily: `unset AWS_PROFILE` before running the backend
   - The backend seed script tries to connect to AWS but it's not required for local development
