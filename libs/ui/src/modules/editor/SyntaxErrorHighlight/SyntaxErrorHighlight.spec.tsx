import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { SyntaxErrorHighlight } from './SyntaxErrorHighlight';

it('renders children', () => {
  render(<SyntaxErrorHighlight>text</SyntaxErrorHighlight>);
  expect(screen.getByText('text')).toBeVisible();
});

it.each<[ComponentProps<typeof SyntaxErrorHighlight>['variant'], RegExp]>([
  ['mismatched-brackets', /not.+match/i],
  ['never-closed', /forget.+clos/i],
  ['never-opened', /forget.+open/i],
])(
  'renders a message for a %s error when hovering the text',
  async (variant, message) => {
    render(<SyntaxErrorHighlight variant={variant}>text</SyntaxErrorHighlight>);

    expect(screen.queryByText(message)).toBeNull();

    await userEvent.hover(screen.getByText('text'));

    expect(await screen.findByText(message)).toBeInTheDocument();
  }
);

it('renders a message for a other syntax errors when hovering the text', async () => {
  render(<SyntaxErrorHighlight>text</SyntaxErrorHighlight>);

  expect(screen.queryByText(/invalid/i)).toBeNull();

  await userEvent.hover(screen.getByText('text'));

  expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
});
