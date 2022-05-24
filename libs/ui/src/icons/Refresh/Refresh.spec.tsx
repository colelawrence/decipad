import { render, screen } from '@testing-library/react';
import { Refresh } from './Refresh';

it('renders a refresh icon', () => {
  render(<Refresh />);
  expect(screen.getByTitle(/refresh/i)).toBeInTheDocument();
});
