import { render } from 'test-utils';
import { Default } from './Paragraph.stories';

describe('Paragraph Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Paragraph" />);
    expect(container).toMatchSnapshot();
  });
});
