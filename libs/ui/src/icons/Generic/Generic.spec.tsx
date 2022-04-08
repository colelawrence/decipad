import { render } from '@testing-library/react';
import { Generic } from './Generic';

it('renders a generic icon', () => {
  const { getByTitle } = render(<Generic />);
  expect(getByTitle(/generic/i)).toBeInTheDocument();
});
