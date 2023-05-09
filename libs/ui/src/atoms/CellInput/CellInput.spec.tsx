import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CellInput } from './CellInput';

it('renders the cell text', () => {
  render(<CellInput value="Inner text" />);

  expect(screen.getByRole('textbox')).toHaveValue('Inner text');
});

it('submits a new value when blurring', async () => {
  const onChange = jest.fn();
  render(<CellInput value="text" onChange={onChange} />);

  await userEvent.type(screen.getByRole('textbox'), ' newtext');

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.blur(screen.getByRole('textbox'));

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('text newtext');
});

it('submits a new value when pressing enter', async () => {
  const onChange = jest.fn();
  render(<CellInput value="text" onChange={onChange} />);

  await userEvent.type(screen.getByRole('textbox'), ' newtext');

  expect(onChange).not.toHaveBeenCalled();

  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('text newtext');
});

it('takes a new value from the props', () => {
  const { rerender } = render(<CellInput value="old" />);

  expect(screen.getByRole('textbox')).toHaveValue('old');

  rerender(<CellInput value="new" />);

  expect(screen.getByRole('textbox')).toHaveValue('new');
});

describe('format prop', () => {
  it('formats input when blurred', () => {
    const format = jest.fn((value) => `${value} bananas`);
    render(<CellInput format={format} value="text" />);

    expect(screen.getByRole('textbox')).toHaveValue('text bananas');
  });

  it('restores original value when focused', () => {
    const format = jest.fn((value) => `${value} bananas`);
    render(<CellInput format={format} value="text" />);

    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveValue('text');

    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveValue('text bananas');
  });
});

describe('readOnly prop', () => {
  it('disables the ability to input text', async () => {
    render(<CellInput readOnly value="text" />);

    await userEvent.type(screen.getByRole('textbox'), 'foo');
    fireEvent.blur(screen.getByRole('textbox'));

    expect(screen.getByRole('textbox')).toHaveValue('text');
  });
});

describe('transform prop', () => {
  it('transforms the input before submitting', async () => {
    const onChange = jest.fn(() => 'transformed');
    const transform = jest.fn(() => 'transformed');
    render(
      <CellInput onChange={onChange} transform={transform} value="text" />
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(transform).not.toHaveBeenCalled();

    await userEvent.type(screen.getByRole('textbox'), 'text');
    fireEvent.blur(screen.getByRole('textbox'));

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
    const { rerender } = render(
      <CellInput onChange={onChange} validate={validate} value="" />
    );

    await userEvent.type(screen.getByRole('textbox'), 'text');
    fireEvent.blur(screen.getByRole('textbox'));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith('text');
    expect(onChange).toHaveBeenCalledWith('text');

    const noValidate = jest.fn(() => false);
    rerender(<CellInput onChange={onChange} validate={noValidate} value="" />);

    await userEvent.type(screen.getByRole('textbox'), 'text');
    fireEvent.blur(screen.getByRole('textbox'));

    expect(noValidate).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('text');
  });
});
