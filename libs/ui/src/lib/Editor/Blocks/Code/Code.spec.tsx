import React from 'react';
import { render } from 'test-utils';
import { Code } from './Code.component';

describe('Code Block', () => {
  it('renders', () => {
    const { container } = render(
      <Code
        element={{
          children: [{ text: 'const hello = "Hello World";' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        const hello = "Hello World";
      </Code>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Code
        element={{
          children: [{ text: 'const hello = "Hello World";' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        const hello = "Hello World";
      </Code>
    );

    expect(container).toMatchSnapshot();
  });
});
