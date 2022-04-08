import { render } from '@testing-library/react';
import { Key } from './Key';

it('renders a key icon', () => {
  const { getByTitle } = render(<Key />);
  expect(getByTitle(/key/i)).toBeInTheDocument();
});
