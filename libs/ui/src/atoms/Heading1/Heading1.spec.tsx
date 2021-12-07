import { render } from '@testing-library/react';
import { Heading1 } from './Heading1';

it('renders the children', () => {
  const { container } = render(<Heading1 Heading="h2">text</Heading1>);
  expect(container).toHaveTextContent('text');
});
