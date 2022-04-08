import { render } from '@testing-library/react';
import { TV } from './TV';

it('renders a tv icon', () => {
  const { getByTitle } = render(<TV />);
  expect(getByTitle(/tv/i)).toBeInTheDocument();
});
