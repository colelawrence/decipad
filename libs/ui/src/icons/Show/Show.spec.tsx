import { render, screen } from '@testing-library/react';
import { Show } from './Show';

it('renders a show icon', () => {
  render(<Show />);
  expect(screen.getByTitle(/show/i)).toBeInTheDocument();
});
