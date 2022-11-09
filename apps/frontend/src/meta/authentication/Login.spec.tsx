import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockConsoleError } from '@decipad/testutils';
import { signIn, SignInResponse } from 'next-auth/react';
import { Login } from './Login';

jest.mock('next-auth/react');
let resolveSignIn!: (resp: SignInResponse) => void;
let rejectSignIn!: (error: Error) => void;
beforeEach(() => {
  (signIn as jest.MockedFunction<typeof signIn>).mockReturnValue(
    new Promise<SignInResponse>((resolve, reject) => {
      resolveSignIn = resolve;
      rejectSignIn = reject;
    })
  );
});
afterEach(() =>
  act(async () =>
    resolveSignIn({
      ok: true,
      error: undefined,
      status: 200,
      url: null,
    })
  )
);

it('disables the login button while the signin request is processed', async () => {
  const { findByText, findByPlaceholderText } = render(<Login />);
  act(async () => (await findByText('Continue with email')).click());
  await userEvent.type(
    await findByPlaceholderText(/e-?mail/i),
    'me@example.com'
  );

  await userEvent.click(await findByText(/submit/i));
  expect(await findByText(/wait/i)).toBeDisabled();
});

it('shows a message when the signin request is processed', async () => {
  const { findByText, findByPlaceholderText } = render(<Login />);
  act(async () => (await findByText('Continue with email')).click());
  await userEvent.type(
    await findByPlaceholderText(/e-?mail/i),
    'me@example.com'
  );
  await userEvent.click(await findByText(/submit/i));

  act(async () =>
    resolveSignIn({ ok: true, error: undefined, status: 200, url: null })
  );
  expect(await findByText(/confirmation.+link/i)).toBeVisible();
});

describe('if the signin request fails', () => {
  mockConsoleError();

  it('shows an error message if the signin request fails', async () => {
    const { findByText, findByPlaceholderText } = render(<Login />);
    act(async () => (await findByText('Continue with email')).click());
    await userEvent.type(
      await findByPlaceholderText(/e-?mail/i),
      'me@example.com'
    );
    await userEvent.click(await findByText(/submit/i));

    rejectSignIn(new Error('oopsie'));
    expect(await findByText(/sorry.+wrong/i)).toBeVisible();
  });
});
