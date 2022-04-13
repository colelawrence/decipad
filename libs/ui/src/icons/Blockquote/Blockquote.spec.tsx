import { render } from '@testing-library/react';
import { Blockquote } from './Blockquote';

it('renders a Blockquote icon', () => {
  const { getByTitle } = render(<Blockquote />);
  expect(getByTitle(/blockquote/i)).toBeInTheDocument();
});
