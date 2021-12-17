import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineCodeError } from './InlineCodeError';

it('renders error in tooltip', async () => {
  const { findByText, getByText, getByTitle } = render(
    <InlineCodeError
      type={{
        kind: 'type-error',
        errorCause: { errType: 'missingVariable', missingVariable: ['foo'] },
      }}
      value={null}
    />
  );

  userEvent.hover(getByTitle(/info/i));

  const docLink = (await findByText(/docs/i)).closest('a')!;

  expect(getByText(/foo/i)).toBeInTheDocument();
  expect(docLink.href).toContain('missingVariable');
});
