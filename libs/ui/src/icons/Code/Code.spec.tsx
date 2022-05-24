import { render, screen } from '@testing-library/react';
import { Code } from './Code';

it('renders a code icon', () => {
  render(<Code />);
  expect(screen.getByTitle(/code/i)).toBeInTheDocument();
});
