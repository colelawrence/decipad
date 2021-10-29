import { render } from '@testing-library/react';
import { Paragraph } from './Paragraph';

it('renders the children', () => {
  const { container } = render(<Paragraph>text</Paragraph>);
  expect(container).toHaveTextContent('text');
});

it('assigns a given placeholder', () => {
  const { getByText } = render(
    <Paragraph placeholder="text goes here">text</Paragraph>
  );
  expect(getByText('text')).toHaveAttribute(
    'aria-placeholder',
    'text goes here'
  );
});
