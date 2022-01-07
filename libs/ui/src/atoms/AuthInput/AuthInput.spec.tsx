import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthInput } from './AuthInput';

describe('Auth Input', () => {
  it('renders the input value', () => {
    const { getByRole } = render(
      <AuthInput
        placeholder="Placeholder"
        value="This is an input"
        onChange={jest.fn()}
      />
    );

    const input = getByRole('textbox');

    expect(input).toHaveValue('This is an input');
  });

  it('onChange gets called', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <AuthInput
        placeholder="Placeholder"
        value="This is an input"
        onChange={onChange}
      />
    );

    const input = getByRole('textbox');
    userEvent.type(input, 'hello');

    expect(onChange).toHaveBeenCalled();
  });
});
