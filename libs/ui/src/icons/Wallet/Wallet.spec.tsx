import { render, screen } from '@testing-library/react';
import { Wallet } from './Wallet';

it('renders a wallet icon', () => {
  render(<Wallet />);
  expect(screen.getByTitle(/wallet/i)).toBeInTheDocument();
});
