import { render } from '@testing-library/react';
import { Check } from './Check';

it('renders a check icon', () => {
  const { getByTitle } = render(<Check />);
  expect(getByTitle(/check/i)).toBeInTheDocument();
});
