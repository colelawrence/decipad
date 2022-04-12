import { render } from '@testing-library/react';
import { Deci } from './Deci';

it('renders a deci icon', () => {
  const { getByTitle } = render(<Deci />);
  expect(getByTitle(/decipad logo/i)).toBeInTheDocument();
});
