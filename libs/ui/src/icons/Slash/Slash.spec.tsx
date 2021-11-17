import { render } from '@testing-library/react';
import { Slash } from './Slash';

it('renders a slash icon', () => {
  const { getByTitle } = render(<Slash />);
  expect(getByTitle(/slash/i)).toBeInTheDocument();
});
