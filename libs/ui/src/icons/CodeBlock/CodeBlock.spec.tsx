import { render, screen } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

it('renders a code icon', () => {
  render(<CodeBlock />);
  expect(screen.getByTitle(/code/i)).toBeInTheDocument();
});
