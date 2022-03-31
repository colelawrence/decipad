import { render } from '@testing-library/react';

import { CodeSyntax } from './CodeSyntax';

it('renders numbers', () => {
  const { getByText } = render(
    <CodeSyntax leaf={{ tokenType: 'number' }}>hey</CodeSyntax>
  );
  expect(getByText(/hey/i)).toBeInTheDocument();
});

it('renders identifiers', () => {
  const { getByText } = render(
    <CodeSyntax leaf={{ tokenType: 'number' }}>hey</CodeSyntax>
  );
  expect(getByText(/hey/i)).toBeInTheDocument();
});

it('renders others', () => {
  const { getByText } = render(
    <CodeSyntax leaf={{ tokenType: 'ws' }}>hey</CodeSyntax>
  );
  expect(getByText(/hey/i)).toBeInTheDocument();
});
