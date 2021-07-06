import { render } from 'test-utils';
import { Highlight } from './Highlight.component';

describe('Highlight Leaf', () => {
  it('renders', () => {
    const { container } = render(
      <Highlight
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Highlight text' }}
        text={{ text: 'Highlight text' }}
      >
        Highlight text
      </Highlight>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Highlight
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Highlight text' }}
        text={{ text: 'Highlight text' }}
      >
        Highlight text
      </Highlight>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the string', () => {
    const { getByText } = render(
      <Highlight
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Highlight text' }}
        text={{ text: 'Highlight text' }}
      >
        Highlight text
      </Highlight>
    );

    getByText('Highlight text');
  });
});
