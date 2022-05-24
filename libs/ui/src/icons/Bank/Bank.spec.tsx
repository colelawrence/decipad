import { render, screen } from '@testing-library/react';
import { Bank } from './Bank';

it('renders a bank icon', () => {
  render(<Bank />);
  expect(screen.getByTitle(/bank/i)).toBeInTheDocument();
});
