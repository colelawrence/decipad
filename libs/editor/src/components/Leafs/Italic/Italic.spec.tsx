import React from 'react';
import { render } from 'test-utils';
import { Default } from './Italic.stories';

describe('Italic Leaf', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Italic" />);
    expect(container).toMatchSnapshot();
  });
});
