import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CellInput } from './CellInput';

it('renders the cell text', () => {
  const { getByRole } = render(<CellInput value="Inner text" />);

  expect(getByRole('textbox')).toHaveValue('Inner text');
});

it('submits a new value when blurring', async () => {
  const onChange = jest.fn();
  const { getByRole } = render(<CellInput value="text" onChange={onChange} />);

  await userEvent.type(getByRole('textbox'), ' newtext');

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.blur(getByRole('textbox'));

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('text newtext');
});

it('submits a new value when pressing enter', async () => {
  const onChange = jest.fn();
  const { getByRole } = render(<CellInput value="text" onChange={onChange} />);

  await userEvent.type(getByRole('textbox'), ' newtext');

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('text newtext');
});

it('takes a new value from the props', async () => {
  const { getByRole, rerender } = render(<CellInput value="old" />);

  expect(getByRole('textbox')).toHaveValue('old');

  rerender(<CellInput value="new" />);

  expect(getByRole('textbox')).toHaveValue('new');
});

describe('format prop', () => {
  it('formats input when blurred', () => {
    const format = jest.fn((value) => `${value} bananas`);
    const { getByRole } = render(<CellInput format={format} value="text" />);

    expect(getByRole('textbox')).toHaveValue('text bananas');
  });

  it('restores original value when focused', () => {
    const format = jest.fn((value) => `${value} bananas`);
    const { getByRole } = render(<CellInput format={format} value="text" />);

    fireEvent.focus(getByRole('textbox'));
    expect(getByRole('textbox')).toHaveValue('text');

    fireEvent.blur(getByRole('textbox'));
    expect(getByRole('textbox')).toHaveValue('text bananas');
  });
});

describe('readOnly prop', () => {
  it('disables the ability to input text', async () => {
    const { getByRole } = render(<CellInput readOnly value="text" />);

    await userEvent.type(getByRole('textbox'), 'foo');
    fireEvent.blur(getByRole('textbox'));

    expect(getByRole('textbox')).toHaveValue('text');
  });
});

describe('transform prop', () => {
  it('transforms the input before submitting', async () => {
    const onChange = jest.fn(() => 'transformed');
    const transform = jest.fn(() => 'transformed');
    const { getByRole } = render(
      <CellInput onChange={onChange} transform={transform} value="text" />
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(transform).not.toHaveBeenCalled();

    await userEvent.type(getByRole('textbox'), 'text');
    fireEvent.blur(getByRole('textbox'));

    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledWith('texttext');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('transformed');
  });
});

describe('validate prop', () => {
  it('validates the input before submitting', async () => {
    const onChange = jest.fn();
    const validate = jest.fn(() => true);
    const { getByRole, rerender } = render(
      <CellInput onChange={onChange} validate={validate} value="" />
    );

    await userEvent.type(getByRole('textbox'), 'text');
    fireEvent.blur(getByRole('textbox'));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith('text');
    expect(onChange).toHaveBeenCalledWith('text');

    const noValidate = jest.fn(() => false);
    rerender(<CellInput onChange={onChange} validate={noValidate} value="" />);

    await userEvent.type(getByRole('textbox'), 'text');
    fireEvent.blur(getByRole('textbox'));

    expect(noValidate).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('text');
  });
});
