import { render } from '@testing-library/react';
import { Heading2 } from './Heading2';

it('renders a heading icon', () => {
  const { getByTitle } = render(<Heading2 />);
  expect(getByTitle(/heading2/i)).toBeInTheDocument();
});
