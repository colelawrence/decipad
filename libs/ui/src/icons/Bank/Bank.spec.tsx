import { render } from '@testing-library/react';
import { Bank } from './Bank';

it('renders a bank icon', () => {
  const { getByTitle } = render(<Bank />);
  expect(getByTitle(/bank/i)).toBeInTheDocument();
});
