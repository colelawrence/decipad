import { render, screen } from '@testing-library/react';
import { List } from './List';

it('renders a list icon', () => {
  render(<List />);
  expect(screen.getByTitle(/List/i)).toBeInTheDocument();
});
