import { render } from '@testing-library/react';

import { CodeSyntax } from './CodeSyntax';

it('renders numbers', () => {
  const { getByText } = render(<CodeSyntax variant="number">hey</CodeSyntax>);
  expect(getByText(/hey/i)).toBeInTheDocument();
});

it('renders identifiers', () => {
  const { getByText } = render(<CodeSyntax variant="number">hey</CodeSyntax>);
  expect(getByText(/hey/i)).toBeInTheDocument();
});

it('renders others', () => {
  const { getByText } = render(<CodeSyntax variant="ws">hey</CodeSyntax>);
  expect(getByText(/hey/i)).toBeInTheDocument();
});
