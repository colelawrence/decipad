import { render } from 'test-utils';
import { Paragraph } from './Paragraph.component';

describe('Paragraph Block', () => {
  it('renders', () => {
    const { container, getByText } = render(
      <Paragraph
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Hello World
      </Paragraph>
    );

    expect(container).toBeDefined();
    getByText('Hello World');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Paragraph
        element={{
          children: [{ text: 'Hello World' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Hello World
      </Paragraph>
    );

    expect(container).toMatchSnapshot();
  });
});
