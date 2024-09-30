import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputFieldHorizontal } from './InputFieldHorizontal';

describe('Auth Input', () => {
  it('renders the input value', () => {
    render(
      <InputFieldHorizontal
        label="My field"
        placeholder="Placeholder"
        value="This is an input"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('This is an input');
  });

  it('onChange gets called', async () => {
    const onChange = vi.fn();
    render(
      <InputFieldHorizontal
        label="My field"
        placeholder="Placeholder"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'x');

    expect(onChange).toHaveBeenLastCalledWith('x');
  });
});
