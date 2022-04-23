import { render } from '@testing-library/react';
import { People } from './People';

it('renders a people icon', () => {
  const { getByTitle } = render(<People />);
  expect(getByTitle(/people/i)).toBeInTheDocument();
});
