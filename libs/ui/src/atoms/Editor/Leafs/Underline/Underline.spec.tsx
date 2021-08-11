import { render } from '@testing-library/react';
import { Underline } from './Underline.stories';

describe('Underline Leaf', () => {
  it('renders the text', () => {
    const { getByText } = render(<Underline text="Underline" />);
    getByText('Underline');
  });
});
