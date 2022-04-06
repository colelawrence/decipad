import { render } from '@testing-library/react';
import { Heading } from './Heading';

it('renders a heading icon', () => {
  const { getByTitle } = render(<Heading />);
  expect(getByTitle(/heading/i)).toBeInTheDocument();
});
