import { render } from '@testing-library/react';
import { Info } from './Info';

it('renders a italic icon', () => {
  const { getByTitle } = render(<Info />);
  expect(getByTitle(/info/i)).toBeInTheDocument();
});
