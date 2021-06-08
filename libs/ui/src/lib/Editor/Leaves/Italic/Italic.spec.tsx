import React from 'react';
import { render } from 'test-utils';
import { Italic } from './Italic.component';

describe('Italic Leaf', () => {
  it('renders', () => {
    const { container } = render(
      <Italic
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Italic text' }}
        text={{ text: 'Italic text' }}
      >
        Italic text
      </Italic>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Italic
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Italic text' }}
        text={{ text: 'Italic text' }}
      >
        Italic text
      </Italic>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the string', () => {
    const { getByText } = render(
      <Italic
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Italic text' }}
        text={{ text: 'Italic text' }}
      >
        Italic text
      </Italic>
    );

    getByText('Italic text');
  });
});
