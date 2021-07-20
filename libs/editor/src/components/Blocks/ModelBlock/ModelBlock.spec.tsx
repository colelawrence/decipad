import React from 'react';
import { render } from 'test-utils';
import { Default } from './ModelBlock.stories';

describe('ModelBlock Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="a = 10 apples" />);
    expect(container).toMatchSnapshot();
  });
});
