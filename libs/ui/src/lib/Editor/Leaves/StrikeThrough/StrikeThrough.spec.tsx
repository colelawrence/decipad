import React from 'react';
import { render } from 'test-utils';
import { StrikeThrough } from './StrikeThrough.component';

describe('StrikeThrough Leaf', () => {
  it('renders', () => {
    const { container } = render(
      <StrikeThrough
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'StrikeThrough text' }}
        text={{ text: 'StrikeThrough text' }}
      >
        StrikeThrough text
      </StrikeThrough>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <StrikeThrough
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'StrikeThrough text' }}
        text={{ text: 'StrikeThrough text' }}
      >
        StrikeThrough text
      </StrikeThrough>
    );

    expect(container).toMatchSnapshot();
  });

  it('renders the string', () => {
    const { getByText } = render(
      <StrikeThrough
        attributes={{ 'data-slate-leaf': true }}
        leaf={{ text: 'StrikeThrough text' }}
        text={{ text: 'StrikeThrough text' }}
      >
        StrikeThrough text
      </StrikeThrough>
    );

    getByText('StrikeThrough text');
  });
});
