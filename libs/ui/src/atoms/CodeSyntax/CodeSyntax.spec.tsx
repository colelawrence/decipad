import { render, screen } from '@testing-library/react';
import { CodeSyntax } from './CodeSyntax';

it('renders numbers', () => {
  render(<CodeSyntax variant="number">hey</CodeSyntax>);
  expect(screen.getByText(/hey/i)).toBeInTheDocument();
});

it('renders identifiers', () => {
  render(<CodeSyntax variant="number">hey</CodeSyntax>);
  expect(screen.getByText(/hey/i)).toBeInTheDocument();
});

it('renders others', () => {
  render(<CodeSyntax variant="ws">hey</CodeSyntax>);
  expect(screen.getByText(/hey/i)).toBeInTheDocument();
});
