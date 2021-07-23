import { render } from 'test-utils';
import { Default } from './Underline.stories';

describe('Underline Leaf', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Underline" />);
    expect(container).toMatchSnapshot();
  });
});
