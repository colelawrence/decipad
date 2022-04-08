import { render } from '@testing-library/react';
import { Battery } from './Battery';

it('renders a battery icon', () => {
  const { getByTitle } = render(<Battery />);
  expect(getByTitle(/battery/i)).toBeInTheDocument();
});
