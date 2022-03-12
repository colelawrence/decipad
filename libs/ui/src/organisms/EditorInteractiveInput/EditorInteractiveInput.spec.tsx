import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorInteractiveInput } from '..';

it('renders an ellipsis menu button', () => {
  const { getByTitle } = render(<EditorInteractiveInput />);
  expect(getByTitle(/ellipsis/i).closest('svg')).toBeVisible();
});

describe('value prop', () => {
  it('renders the value in an input field', () => {
    const { getByDisplayValue, rerender } = render(
      <EditorInteractiveInput value="text" />
    );
    expect(getByDisplayValue('text').closest('input')).toBeVisible();

    rerender(<EditorInteractiveInput value="different text" />);
    expect(getByDisplayValue('different text').closest('input')).toBeVisible();
  });
});

describe('onChangeValue prop', () => {
  it('gets called when blurring the input field', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = render(
      <EditorInteractiveInput value="text" onChangeValue={onChangeValue} />
    );

    expect(onChangeValue).not.toHaveBeenCalled();

    const input = getByDisplayValue('text');
    userEvent.type(input, 'much');
    fireEvent.blur(input);

    expect(onChangeValue).toHaveBeenCalledTimes(1);
    expect(onChangeValue).toHaveBeenCalledWith('textmuch');
  });

  it('gets called when pressing enter in the input field', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = render(
      <EditorInteractiveInput value="text" onChangeValue={onChangeValue} />
    );

    const input = getByDisplayValue('text');
    userEvent.type(input, 'much');

    expect(onChangeValue).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChangeValue).toHaveBeenCalledTimes(1);
    expect(onChangeValue).toHaveBeenCalledWith('textmuch');
  });
});
