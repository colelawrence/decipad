import { render } from '@testing-library/react';
import { LeftArrow } from './LeftArrow';

it('renders a left arrow icon', () => {
  const { getByTitle } = render(<LeftArrow />);
  expect(getByTitle(/left arrow/i)).toBeInTheDocument();
});
