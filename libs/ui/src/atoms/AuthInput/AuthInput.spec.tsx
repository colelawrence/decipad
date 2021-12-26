import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthInput } from './AuthInput';

describe('Auth Input', () => {
  it('renders with min width', () => {
    const { getByRole } = render(<AuthInput placeholder="Placeholder" />);

    const input = getByRole('textbox');

    expect(
      Number(getComputedStyle(input).minWidth.replace('px', ''))
    ).toBeGreaterThanOrEqual(374);
  });

  it('types into the input', () => {
    const { getByRole } = render(<AuthInput placeholder="Placeholder" />);

    const input = getByRole('textbox');

    userEvent.type(input, 'johndoe@gmail.com');
    expect(input).toHaveValue('johndoe@gmail.com');
  });
});
