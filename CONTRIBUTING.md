# Contributing to Decipad

Thank you for your interest in contributing to Decipad! We welcome contributions from developers of all skill levels and backgrounds. This guide will help you get started with contributing to our open-source data notebook platform.

> **First time contributing?** Check out our [New Developer Guide](docs/README.md#new-developer-guide) for a step-by-step walkthrough, then return here for detailed contribution guidelines.

## Table of Contents

- [Getting Started](#getting-started) - Prerequisites and initial setup
- [Development Workflow](#development-workflow) - How to make changes
- [Code Standards](#code-standards) - Coding conventions and best practices
- [Testing Guidelines](#testing-guidelines) - How to write and run tests
- [Pull Request Process](#pull-request-process) - Submitting your changes
- [Issue Guidelines](#issue-guidelines) - Reporting bugs and suggesting features
- [Community Guidelines](#community-guidelines) - Code of conduct and communication
- [Resources](#resources) - Helpful links and documentation

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: Version 24.0.0 or higher
- **Yarn**: Package manager
- **Git**: Version control
- **Rust**: For WebAssembly compilation
- **wasm-pack**: WebAssembly packaging tool

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/decipad.git
   cd decipad
   ```
3. **Install dependencies**:
   ```bash
   yarn install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Create backend environment file
   touch apps/backend/.env
   # IMPORTANT: Set NEXTAUTH_URL and DECI_APP_URL_BASE to http://localhost:3000 in apps/backend/.env
   ```
5. **Start the development server**:
   ```bash
   yarn start
   ```

For detailed setup instructions, see our [Local Setup Guide](docs/LOCAL_SETUP.md).

### Finding Issues to Work On

- **Good First Issues**: Look for issues labeled `good first issue`
- **Bug Reports**: Issues labeled `bug` that need fixing
- **Feature Requests**: Issues labeled `enhancement` for new features
- **Documentation**: Issues labeled `documentation` for improving docs

## Development Workflow

### 1. Create a Branch

Create a new branch for your feature or fix:

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow our coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

Run the test suite to ensure your changes don't break anything:

```bash
# Run all tests
yarn test

# Run linting
yarn lint

# Run type checking
yarn typecheck

# Run E2E tests
yarn e2e
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git add .
git commit -m "feat: add new feature description"
git commit -m "fix: resolve issue with component"
git commit -m "docs: update API documentation"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Standards

### TypeScript/JavaScript

- **TypeScript**: Use TypeScript for all new code
- **Type Safety**: Define proper types and interfaces
- **ESLint**: Follow our ESLint configuration
- **Prettier**: Use Prettier for code formatting

### React Components

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define proper TypeScript interfaces for props
- **Component Structure**: Follow our component organization patterns
- **Styling**: Use Emotion for CSS-in-JS or Tailwind CSS classes

### File Organization

- **Naming**: Use kebab-case for file names
- **Exports**: Use named exports for better tree shaking
- **Imports**: Group imports logically (external, internal, relative)
- **Comments**: Add JSDoc comments for public APIs

### Example Component Structure

```typescript
import React from 'react';
import { styled } from '@emotion/react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledButton = styled.button<{ variant: string }>`
  /* styles */
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
}) => {
  return (
    <StyledButton variant={variant} onClick={onClick}>
      {children}
    </StyledButton>
  );
};
```

## Testing Guidelines

### Unit Tests

- **Coverage**: Aim for high test coverage on new code
- **Test Files**: Place tests in `*.test.ts` or `*.test.tsx` files
- **Test Structure**: Use describe/it blocks for organization
- **Mocking**: Mock external dependencies appropriately

### Integration Tests

- **API Tests**: Test API endpoints and GraphQL resolvers
- **Database Tests**: Test database operations and queries
- **Service Tests**: Test service layer functionality

### End-to-End Tests

- **Critical Paths**: Test critical user journeys
- **Cross-browser**: Test on multiple browsers
- **Accessibility**: Ensure accessibility compliance

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are conventional
- [ ] Branch is up to date with main

### Pull Request Template

Use this template for your pull request:

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues

Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer reviews the code
3. **Testing**: Ensure all tests pass
4. **Approval**: Maintainer approves the PR
5. **Merge**: PR is merged to main branch

## Issue Guidelines

### Reporting Bugs

When reporting bugs, include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

### Suggesting Features

When suggesting features, include:

- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you envision it working
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other relevant information

## Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](docs/CODE_OF_CONDUCT.md). Please read it before contributing.

### Communication

- **GitHub Issues**: Use for bug reports and feature requests
- **GitHub Discussions**: Use for questions and general discussion
- **Discord**: Join our community Discord for real-time chat
- **Email**: Contact support@decipad.com for support

### Getting Help

- **Documentation**: Check our comprehensive docs
- **Examples**: Look at existing code for patterns
- **Ask Questions**: Don't hesitate to ask for help
- **Be Patient**: Maintainers are volunteers

## Resources

### Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Code Structure](docs/CODE_STRUCTURE.md)
- [Local Setup](docs/LOCAL_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [CI/CD Guide](docs/CI.md)

### Development Tools

- **Nx**: Monorepo management
- **Storybook**: Component development
- **Playwright**: E2E testing
- **Vitest**: Unit testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Nx Documentation](https://nx.dev)
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)

## Recognition

We appreciate all contributions, no matter how small! Contributors are recognized in:

- **Contributors List**: GitHub contributors page
- **Release Notes**: Mentioned in release notes
- **Community**: Acknowledged in our community channels

## Questions?

If you have any questions about contributing, please:

1. Check our documentation first
2. Search existing issues and discussions
3. Ask in our Discord community
4. Open a new issue if needed

Thank you for contributing to Decipad! 🎉
