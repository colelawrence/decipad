import { render } from '@testing-library/react';
import { Heading2 } from './Heading2';

describe('when active', () => {
  it('renders the children', () => {
    const { container } = render(
      <Heading2 id="1" Heading="h3">
        text
      </Heading2>
    );
    expect(container).toHaveTextContent('text');
  });
});
