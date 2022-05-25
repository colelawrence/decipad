import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputField } from './InputField';

describe('Auth Input', () => {
  it('renders the input value', () => {
    render(
      <InputField
        placeholder="Placeholder"
        value="This is an input"
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('This is an input');
  });

  it('onChange gets called', async () => {
    const onChange = jest.fn();
    render(
      <InputField placeholder="Placeholder" value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'x');

    expect(onChange).toHaveBeenLastCalledWith('x');
  });
});
