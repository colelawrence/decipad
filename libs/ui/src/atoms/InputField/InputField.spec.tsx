import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputField } from './InputField';

describe('Auth Input', () => {
  it('renders the input value', () => {
    const { getByRole } = render(
      <InputField
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
      <InputField placeholder="Placeholder" value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    userEvent.type(input, 'x');

    expect(onChange).toHaveBeenLastCalledWith('x');
  });
});
