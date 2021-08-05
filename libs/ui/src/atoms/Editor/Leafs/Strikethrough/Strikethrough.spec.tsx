import { render } from '@testing-library/react';
import { Strikethrough } from './Strikethrough.stories';

describe('Strikethrough Leaf', () => {
  it('renders the text', () => {
    const { getByText } = render(<Strikethrough text="Strikethrough" />);
    expect(getByText('Strikethrough')).toBeVisible();
  });
});
