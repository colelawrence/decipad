import { render } from 'test-utils';
import { Default } from './Blockquote.stories';

describe('Blockquote Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Hello World" />);
    expect(container).toMatchSnapshot();
  });
});
