import { render, screen } from '@testing-library/react';
import { Paragraph } from './Paragraph';

describe('when active', () => {
  it('renders the children', () => {
    const { container } = render(<Paragraph>text</Paragraph>);
    expect(container).toHaveTextContent('text');
  });

  it('assigns a given placeholder', () => {
    render(<Paragraph placeholder="text goes here">text</Paragraph>);
    expect(screen.getByTestId('paragraph-placeholder')).toHaveTextContent(
      'text goes here'
    );
  });
});
