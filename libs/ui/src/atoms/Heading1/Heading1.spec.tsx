import { render } from '@testing-library/react';
import { Heading1 } from './Heading1';

describe('when active', () => {
  it('renders the children', () => {
    const { container } = render(
      <Heading1 id="1" Heading="h2">
        text
      </Heading1>
    );
    expect(container).toHaveTextContent('text');
  });
});
