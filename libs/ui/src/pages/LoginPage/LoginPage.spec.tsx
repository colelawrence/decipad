import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

describe('Login page', () => {
  it('disables the button when the input value is not a valid email', () => {
    const { getByRole } = render(<LoginPage onSubmit={jest.fn()} />);

    const input = getByRole('textbox');
    const submitButton = getByRole('button');

    expect(submitButton).toHaveAttribute('disabled');

    userEvent.type(input, 'johndoe');
    expect(submitButton).toHaveAttribute('disabled');

    userEvent.type(input, '@example.com');
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('emits a submit event when typing an email and clicking continue', () => {
    const { getByText, getByRole } = render(<LoginPage onSubmit={jest.fn()} />);

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    userEvent.type(input, 'johndoe@example.com');
    userEvent.click(getByText(/continue/i));
  });
});
