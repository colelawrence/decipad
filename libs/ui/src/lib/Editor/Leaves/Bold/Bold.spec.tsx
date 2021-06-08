import React from 'react';
import { render } from 'test-utils';
import { Bold } from './Bold.component';

describe('Bold Leaf', () => {
  it('renders', () => {
    const { container } = render(
      <Bold
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Bold text' }}
        text={{ text: 'Bold text' }}
      >
        Bold text
      </Bold>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Bold
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Bold text' }}
        text={{ text: 'Bold text' }}
      >
        Bold text
      </Bold>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the string', () => {
    const { getByText } = render(
      <Bold
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'Bold text' }}
        text={{ text: 'Bold text' }}
      >
        Bold text
      </Bold>
    );

    getByText('Bold text');
  });
});
