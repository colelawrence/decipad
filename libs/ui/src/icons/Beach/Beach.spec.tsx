import { render } from '@testing-library/react';
import { Beach } from './Beach';

it('renders a beach icon', () => {
  const { getByTitle } = render(<Beach />);
  expect(getByTitle(/beach/i)).toBeInTheDocument();
});
