import { render, screen } from '@testing-library/react';
import { Cards } from './Cards';

it('renders the cards icon', () => {
  render(<Cards />);
  expect(screen.getByTitle(/cards/i)).toBeInTheDocument();
});
