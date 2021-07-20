import React from 'react';
import { render } from 'test-utils';
import { Default } from './Subheading.stories';

describe('Subheading Block', () => {
  it('matches snapshot', () => {
    const { container } = render(<Default text="Subheading" />);
    expect(container).toMatchSnapshot();
  });
});
