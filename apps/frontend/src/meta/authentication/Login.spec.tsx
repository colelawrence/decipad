import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInResponse, signIn } from 'next-auth/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

jest.mock('next-auth/react');
let resolveSignIn!: (resp: SignInResponse) => void;
beforeEach(() => {
  (signIn as jest.MockedFunction<typeof signIn>).mockReturnValue(
    new Promise<SignInResponse>((resolve) => {
      resolveSignIn = resolve;
    })
  );
});
afterEach(() =>
  act(() =>
    resolveSignIn({
      ok: true,
      error: undefined,
      status: 200,
      url: null,
    })
  )
);

it('shows a message when the signin request is processed', async () => {
  const { findByText, findByPlaceholderText } = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  await act(async () => (await findByText('Continue')).click());
  await userEvent.type(
    await findByPlaceholderText(/e-?mail/i),
    'me@example.com'
  );
  await userEvent.click(await findByText(/Continue/i));

  await act(() =>
    resolveSignIn({ ok: true, error: undefined, status: 200, url: null })
  );
  expect(await findByText(/open.+link/i)).toBeVisible();
});
