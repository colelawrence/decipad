import { render } from '@testing-library/react';
import { Bold } from './Bold.stories';

describe('Bold Leaf', () => {
  it('renders the text', () => {
    const { getByText } = render(<Bold text="Bold" />);
    getByText('Bold');
  });
});
