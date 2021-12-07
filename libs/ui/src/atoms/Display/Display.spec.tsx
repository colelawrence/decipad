import { render } from '@testing-library/react';
import { Display } from './Display';

it('renders the children', () => {
  const { container } = render(<Display Heading="h1">text</Display>);
  expect(container).toHaveTextContent('text');
});

it('assigns a given placeholder', () => {
  const { getByText } = render(
    <Display Heading="h1" placeholder="text goes here">
      text
    </Display>
  );
  expect(getByText('text').closest('h1')).toHaveAttribute(
    'aria-placeholder',
    'text goes here'
  );
});
