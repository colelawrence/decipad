import React from 'react';
import { render } from 'test-utils';
import { CodeBlock } from './CodeBlock.component';

describe('CodeBlock Block', () => {
  it('renders', () => {
    const { container } = render(
      <CodeBlock
        element={{
          id: 'test',
          children: [{ text: 'a = 10 apples \n b = 10 apples \n a + b' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        a = 10 apples b = 10 apples a + b
      </CodeBlock>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <CodeBlock
        element={{
          id: 'test',
          children: [{ text: 'a = 10 apples \n b = 10 apples \n a + b' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        a = 10 apples b = 10 apples a + b
      </CodeBlock>
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with no results', () => {
    const { container } = render(
      <CodeBlock
        element={{
          id: 'noResult',
          children: [{ text: 'NoResultPls' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        a = 10 apples b = 10 apples a + b
      </CodeBlock>
    );

    expect(container).toMatchSnapshot();
  });
});
