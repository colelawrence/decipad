import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CodeSyntaxErrorHighlight } from './CodeSyntaxErrorHighlight';

it('renders children', () => {
  render(<CodeSyntaxErrorHighlight>text</CodeSyntaxErrorHighlight>);
  expect(screen.getByText('text')).toBeVisible();
});

it.each<[ComponentProps<typeof CodeSyntaxErrorHighlight>['variant'], RegExp]>([
  ['mismatched-brackets', /not.+match/i],
  ['never-closed', /forget.+clos/i],
  ['never-opened', /forget.+open/i],
])(
  'renders a message for a %s error when hovering the text',
  async (variant, message) => {
    render(
      <CodeSyntaxErrorHighlight variant={variant}>
        text
      </CodeSyntaxErrorHighlight>
    );

    expect(screen.queryByText(message)).toBeNull();

    await userEvent.hover(screen.getByText('text'));

    expect(await screen.findByText(message)).toBeInTheDocument();
  }
);

it('renders a message for a other syntax errors when hovering the text', async () => {
  render(<CodeSyntaxErrorHighlight>text</CodeSyntaxErrorHighlight>);

  expect(screen.queryByText(/invalid/i)).toBeNull();

  await userEvent.hover(screen.getByText('text'));

  expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
});
