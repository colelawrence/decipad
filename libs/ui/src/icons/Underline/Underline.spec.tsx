import { render } from '@testing-library/react';
import { Underline } from './Underline';

it('renders a underline icon', () => {
  const { getByTitle } = render(<Underline />);
  expect(getByTitle(/underline/i)).toBeInTheDocument();
});
