import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

describe('Login page', () => {
  it('disables the button when the input value is not a valid email', async () => {
    const { getByRole, findByText } = render(
      <MemoryRouter>
        <LoginPage onSubmit={jest.fn()} />
      </MemoryRouter>
    );
    await act(async () => (await findByText('Continue')).click());

    const input = getByRole('textbox');
    const submitButton = getByRole('button');

    expect(submitButton).toHaveAttribute('disabled');

    await userEvent.type(input, 'johndoe');
    expect(submitButton).toHaveAttribute('disabled');

    await userEvent.type(input, '@example.com');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('emits a submit event when typing an email and clicking continue', async () => {
    const { getByText, getByRole, findByText } = render(
      <MemoryRouter>
        <LoginPage onSubmit={jest.fn()} />
      </MemoryRouter>
    );
    await act(async () => (await findByText('Continue')).click());

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    await userEvent.type(input, 'johndoe@example.com');
    await userEvent.click(getByText(/Continue/i));
  });
});
