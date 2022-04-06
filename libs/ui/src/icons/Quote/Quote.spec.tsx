import { render } from '@testing-library/react';
import { Quote } from './Quote';

it('renders a quote icon', () => {
  const { getByTitle } = render(<Quote />);
  expect(getByTitle(/quote/i)).toBeInTheDocument();
});
