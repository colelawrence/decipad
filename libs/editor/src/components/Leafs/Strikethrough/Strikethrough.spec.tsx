import React from 'react';
import { render } from 'test-utils';
import { Default } from './Strikethrough.stories';

describe('Strikethrough Leaf', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Strikethrough" />);
    expect(container).toMatchSnapshot();
  });
});
