import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeSyntaxErrorHighlight } from './CodeSyntaxErrorHighlight';

it('renders children', () => {
  const { getByText } = render(
    <CodeSyntaxErrorHighlight>text</CodeSyntaxErrorHighlight>
  );
  expect(getByText('text')).toBeVisible();
});

it.each<[ComponentProps<typeof CodeSyntaxErrorHighlight>['variant'], RegExp]>([
  ['mismatched-brackets', /not.+match/i],
  ['never-closed', /forget.+clos/i],
  ['never-opened', /forget.+open/i],
])(
  'renders a message for a %s error when hovering the text',
  async (variant, message) => {
    const { findByText, getByText, queryByText } = render(
      <CodeSyntaxErrorHighlight variant={variant}>
        text
      </CodeSyntaxErrorHighlight>
    );

    expect(queryByText(message)).toBeNull();

    userEvent.hover(getByText('text'));

    expect(await findByText(message)).toBeInTheDocument();
  }
);

it('renders a message for a other syntax errors when hovering the text', async () => {
  const { findByText, getByText, queryByText } = render(
    <CodeSyntaxErrorHighlight>text</CodeSyntaxErrorHighlight>
  );

  expect(queryByText(/invalid/i)).toBeNull();

  userEvent.hover(getByText('text'));

  expect(await findByText(/invalid/i)).toBeInTheDocument();
});
