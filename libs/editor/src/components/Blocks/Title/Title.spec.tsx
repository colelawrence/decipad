import React from 'react';
import { render } from 'test-utils';
import { Default } from './Title.stories';

describe('Title Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Title" />);
    expect(container).toMatchSnapshot();
  });
});
