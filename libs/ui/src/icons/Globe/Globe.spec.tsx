import { render } from '@testing-library/react';
import { Globe } from './Globe';

it('renders a globe icon', () => {
  const { getByTitle } = render(<Globe />);
  expect(getByTitle(/glob/i)).toBeInTheDocument();
});
