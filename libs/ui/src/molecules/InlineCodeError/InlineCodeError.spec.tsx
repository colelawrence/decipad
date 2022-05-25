import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineCodeError } from './InlineCodeError';

it('renders error in tooltip', async () => {
  render(
    <InlineCodeError
      type={{
        kind: 'type-error',
        errorCause: { errType: 'missing-variable', missingVariable: ['foo'] },
      }}
      value={null}
    />
  );

  await userEvent.hover(screen.getByTitle(/Warning/i));

  const docLink = (await screen.findByText(/docs/i)).closest('a')!;

  expect(screen.getByText(/foo/i)).toBeInTheDocument();
  expect(docLink.href).toContain('missing-variable');
});
