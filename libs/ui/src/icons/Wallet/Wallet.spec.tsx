import { render } from '@testing-library/react';
import { Wallet } from './Wallet';

it('renders a wallet icon', () => {
  const { getByTitle } = render(<Wallet />);
  expect(getByTitle(/wallet/i)).toBeInTheDocument();
});
