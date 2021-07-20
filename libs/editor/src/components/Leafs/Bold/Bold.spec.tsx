import React from 'react';
import { render } from 'test-utils';
import { Default } from './Bold.stories';

describe('Bold Leaf', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Bold" />);
    expect(container).toMatchSnapshot();
  });
});
