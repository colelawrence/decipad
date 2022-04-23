import { render } from '@testing-library/react';
import { Highlight } from './Highlight';

it('renders a highlight icon', () => {
  const { getByTitle } = render(<Highlight />);
  expect(getByTitle(/highlight/i)).toBeInTheDocument();
});
