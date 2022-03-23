import { render } from '@testing-library/react';
import { Add } from './Add';

it('renders an "add" icon', () => {
  const { getByTitle } = render(<Add />);
  expect(getByTitle(/add/i)).toBeInTheDocument();
});
