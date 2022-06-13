import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

describe('Login page', () => {
  it('disables the button when the input value is not a valid email', async () => {
    const { getByRole } = render(<LoginPage onSubmit={jest.fn()} />);

    const input = getByRole('textbox');
    const submitButton = getByRole('button');

    expect(submitButton).toHaveAttribute('disabled');

    await userEvent.type(input, 'johndoe');
    expect(submitButton).toHaveAttribute('disabled');

    await userEvent.type(input, '@example.com');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('emits a submit event when typing an email and clicking continue', async () => {
    const { getByText, getByRole } = render(<LoginPage onSubmit={jest.fn()} />);

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    await userEvent.type(input, 'johndoe@example.com');
    await userEvent.click(getByText(/continue/i));
  });

  it('disables the button while submitting', async () => {
    let resolveSubmit!: () => void;
    const handleSubmit = jest.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      })
    );
    const { findByText, getByRole } = render(
      <LoginPage onSubmit={handleSubmit} />
    );

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    await userEvent.type(input, 'johndoe@example.com');
    await userEvent.click(await findByText(/continue/i));

    expect(await findByText(/continue/i)).toBeDisabled();

    await act(async () => {
      resolveSubmit();
    });
    expect(await findByText(/continue/i)).not.toBeDisabled();
  });
});
