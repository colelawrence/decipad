import { render } from '@testing-library/react';
import { Strikethrough } from './Strikethrough';

it('renders a strikethrough icon', () => {
  const { getByTitle } = render(<Strikethrough />);
  expect(getByTitle(/strikethrough/i)).toBeInTheDocument();
});
