import React from 'react';
import { render } from 'test-utils';
import { Type } from '@decipad/language';
import { CodeBlock } from './CodeBlock.component';

describe('CodeBlock Block', () => {
  const result = () => ({
    type: Type.build({
      type: 'number',
      unit: {
        unit: 'apples',
      },
    } as any),
    value: [20],
    errors: [],
  });

  it('renders', () => {
    const { container } = render(
      <CodeBlock
        element={{
          children: [{ text: 'a = 10 apples \n b = 10 apples \n a + b' }],
          result: result(),
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
          children: [{ text: 'a = 10 apples \n b = 10 apples \n a + b' }],
          result: result(),
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        a = 10 apples b = 10 apples a + b
      </CodeBlock>
    );

    expect(container).toMatchSnapshot();
  });
});
