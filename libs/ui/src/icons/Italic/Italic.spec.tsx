import { render } from '@testing-library/react';
import { Italic } from './Italic';

it('renders a italic icon', () => {
  const { getByTitle } = render(<Italic />);
  expect(getByTitle(/italic/i)).toBeInTheDocument();
});
