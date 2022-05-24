import { render, screen } from '@testing-library/react';
import { Warning } from './Warning';

it('renders a warning icon', () => {
  render(<Warning />);
  expect(screen.getByTitle(/warning/i)).toBeInTheDocument();
});
