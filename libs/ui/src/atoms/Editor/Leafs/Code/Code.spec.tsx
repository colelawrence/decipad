import { render } from '@testing-library/react';
import { Code } from './Code.stories';

describe('Code Leaf', () => {
  it('renders the text', () => {
    const { getByText } = render(<Code text="Code" />);
    getByText('Code');
  });
});
