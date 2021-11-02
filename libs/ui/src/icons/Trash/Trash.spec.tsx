import { render } from '@testing-library/react';
import { Trash } from './Trash';

it('renders a trash icon', () => {
  const { getByTitle } = render(<Trash />);
  expect(getByTitle(/trash/i)).toBeInTheDocument();
});
