import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSubmittableInput } from './useSubmittableInput';

const FakeInput = (props: Parameters<typeof useSubmittableInput>[0]) => {
  const inputProps = useSubmittableInput(props);
  return <input {...inputProps} />;
};

describe('onChange arg', () => {
  it('does not get called when typing', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<FakeInput onChange={onChange} value="" />);

    userEvent.type(getByRole('textbox'), 'text');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('gets called with the new value when input is blurred', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<FakeInput onChange={onChange} value="" />);

    userEvent.type(getByRole('textbox'), 'text');
    fireEvent.blur(getByRole('textbox'));

    expect(onChange).toHaveBeenCalledWith('text');
  });

  it('gets called with the new value when input pressing the Enter key', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<FakeInput onChange={onChange} value="" />);

    userEvent.type(getByRole('textbox'), 'text');
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('text');
  });
});

describe('format arg', () => {
  it('formats value when rendering', () => {
    const format = jest.fn((value) => `${value}n't`);
    const { getByRole, rerender } = render(
      <FakeInput format={format} value="text" />
    );

    expect(format).toHaveBeenCalledTimes(1);
    expect((getByRole('textbox') as HTMLInputElement).value).toBe("textn't");

    rerender(<FakeInput format={format} value="box" />);
    expect(format).toHaveBeenCalledTimes(2);
    expect((getByRole('textbox') as HTMLInputElement).value).toBe("boxn't");
  });
});

describe('validate arg', () => {
  it('does not get called when typing', () => {
    const validate = jest.fn();
    const { getByRole } = render(<FakeInput validate={validate} value="" />);

    userEvent.type(getByRole('textbox'), 'text');

    expect(validate).not.toHaveBeenCalled();
  });

  describe('when submitting a new change that is valid', () => {
    it('calls onChange with the new value', () => {
      const onChange = jest.fn();
      const validate = jest.fn(() => true);
      const { getByRole } = render(
        <FakeInput onChange={onChange} validate={validate} value="" />
      );

      userEvent.type(getByRole('textbox'), 'text');
      fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

      expect(validate).toHaveBeenCalledWith('text');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('when submitting a new change that is not valid', () => {
    it('calls onChange with an empty string', () => {
      const onChange = jest.fn();
      const validate = jest.fn(() => false);
      const { getByRole } = render(
        <FakeInput onChange={onChange} validate={validate} value="" />
      );

      userEvent.type(getByRole('textbox'), 'text');
      fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

      expect(validate).toHaveBeenCalledWith('text');
      expect(onChange).toHaveBeenCalledWith('');
    });
  });
});

describe('transform prop', () => {
  it('transforms the value for the onChange callback', () => {
    const onChange = jest.fn();
    const transform = jest.fn((value) => `${value}n't`);
    const { getByRole } = render(
      <FakeInput onChange={onChange} transform={transform} value="" />
    );

    userEvent.type(getByRole('textbox'), 'text');
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(transform).toHaveBeenCalledWith('text');
    expect(onChange).toHaveBeenCalledWith("textn't");
  });
});
