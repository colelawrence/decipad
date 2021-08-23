import { render } from '@testing-library/react';
import { Delete } from './Delete';

it('renders a delete icon', () => {
  const { getByTitle } = render(<Delete />);
  expect(getByTitle(/delete/i)).toBeInTheDocument();
});
