import { render } from '@testing-library/react';
import { Italic } from './Italic.stories';

describe('Italic Leaf', () => {
  it('renders the text', () => {
    const { getByText } = render(<Italic text="Italic" />);
    getByText('Italic');
  });
});
