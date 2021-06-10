import React from 'react';
import { render } from 'test-utils';
import { Mention } from './Mention.component';

describe('Mention Inline Block', () => {
  it('renders', () => {
    const { container } = render(
      <Mention
        element={{
          children: [{ text: 'Hello World' }],
          user: 'johndoe',
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Next text
      </Mention>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Mention
        element={{
          children: [{ text: 'Hello World' }],
          user: 'johndoe',
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Next text
      </Mention>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the user tag and continues to the next text', () => {
    const { getByText } = render(
      <Mention
        element={{
          children: [{ text: 'Hello World' }],
          user: 'johndoe',
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        Next text
      </Mention>
    );

    getByText('@johndoe');
    getByText('Next text');
  });
});
