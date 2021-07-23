import { render } from 'test-utils';
import { Default } from './Subtitle.stories';

describe('Subtitle Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Subtitle" />);
    expect(container).toMatchSnapshot();
  });
});
