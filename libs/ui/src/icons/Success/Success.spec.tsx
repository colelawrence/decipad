import { render } from '@testing-library/react';
import { Success } from './Success';

it('renders a success icon', () => {
  const { getByTitle } = render(<Success />);
  expect(getByTitle(/success/i)).toBeInTheDocument();
});
