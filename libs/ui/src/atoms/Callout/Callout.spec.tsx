import { render } from '@testing-library/react';
import { Callout } from './Callout';

it('renders the children', () => {
  const { container } = render(<Callout>text</Callout>);
  expect(container).toHaveTextContent('text');
});
