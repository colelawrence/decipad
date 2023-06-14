import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetch from 'jest-fetch-mock';
import { SessionProvider } from 'next-auth/react';
import { InlineCodeError } from './InlineCodeError';

describe('InlineCodeError', () => {
  beforeAll(() => {
    fetch.enableMocks();
  });

  afterAll(() => {
    fetch.disableMocks();
  });

  it('renders error in tooltip', async () => {
    render(
      <SessionProvider>
        <InlineCodeError
          type={{
            kind: 'type-error',
            errorCause: {
              errType: 'missing-variable',
              missingVariable: ['foo'],
            },
          }}
          value={null}
        />
      </SessionProvider>
    );

    await userEvent.hover(screen.getByTitle(/Warning/i));

    const docLink = (await screen.findByText(/docs/i)).closest('a')!;

    expect(screen.getByText(/foo/i)).toBeInTheDocument();
    expect(docLink.href).toContain('/docs');
  });
});
