import { render } from 'test-utils';
import { Blockquote } from './Blockquote.component';

describe('Blockquote component', () => {
  it('renders', () => {
    const { container } = render(
      <Blockquote
        element={{
          children: [{ text: 'The quick brown fox jumps over the lazy dog.' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        The quick brown fox jumps over the lazy dog.
      </Blockquote>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Blockquote
        element={{
          children: [{ text: 'The quick brown fox jumps over the lazy dog.' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        The quick brown fox jumps over the lazy dog.
      </Blockquote>
    );

    expect(container).toMatchSnapshot();
  });
});
