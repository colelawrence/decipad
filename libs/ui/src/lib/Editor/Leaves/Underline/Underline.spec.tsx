import React from 'react';
import { render } from 'test-utils';
import { Underline } from './Underline.component';

describe('Underline Leaf', () => {
  it('renders', () => {
    const { container } = render(
      <Underline
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Underline text' }}
        text={{ text: 'Underline text' }}
      >
        Underline text
      </Underline>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Underline
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Underline text' }}
        text={{ text: 'Underline text' }}
      >
        Underline text
      </Underline>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the string', () => {
    const { getByText } = render(
      <Underline
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Underline text' }}
        text={{ text: 'Underline text' }}
      >
        Underline text
      </Underline>
    );

    getByText('Underline text');
  });
});
