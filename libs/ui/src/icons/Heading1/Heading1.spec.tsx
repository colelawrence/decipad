import { render } from '@testing-library/react';
import { Heading1 } from './Heading1';

it('renders a heading icon', () => {
  const { getByTitle } = render(<Heading1 />);
  expect(getByTitle(/heading1/i)).toBeInTheDocument();
});
