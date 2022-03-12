import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Deci } from '../../icons';
import { Interactive } from './Interactive';

const defaultProps = {
  children: 'children',
};

it('renders children', () => {
  const { getByText } = render(<Interactive {...defaultProps} />);
  expect(getByText(defaultProps.children)).toBeVisible();
});

it('renders name input changes', () => {
  const { getByDisplayValue, getByRole } = render(
    <Interactive {...defaultProps} />
  );
  userEvent.type(getByRole('textbox'), 'text');
  expect(getByDisplayValue(/text/i).closest('input')).toBeVisible();
});

describe('icon prop', () => {
  it('render a default icon', () => {
    const { getByTitle } = render(<Interactive {...defaultProps} />);
    expect(getByTitle(/frame/i).closest('svg')).toBeVisible();
  });

  it('render the given icon', () => {
    const { getByTitle, queryByTitle } = render(
      <Interactive {...defaultProps} icon={<Deci />} />
    );
    expect(queryByTitle(/placeholder/i)).toBeNull();
    expect(getByTitle(/deci/i).closest('svg')).toBeVisible();
  });
});

describe('name prop', () => {
  it('renders a placeholder by default', () => {
    const { getByPlaceholderText } = render(<Interactive {...defaultProps} />);
    expect(getByPlaceholderText(/name/i).closest('input')).toBeVisible();
  });

  it('renders the given name', () => {
    const { getByDisplayValue, rerender } = render(
      <Interactive {...defaultProps} name="text" />
    );
    expect(getByDisplayValue('text').closest('input')).toBeVisible();

    rerender(<Interactive {...defaultProps} name="more text" />);
    expect(getByDisplayValue('more text').closest('input')).toBeVisible();
  });
});

describe('onNameChange prop', () => {
  it('gets called when blurring the input field', () => {
    const onNameChange = jest.fn();
    const { getByRole } = render(
      <Interactive {...defaultProps} onChangeName={onNameChange} />
    );

    userEvent.type(getByRole('textbox'), 'text');

    expect(onNameChange).not.toHaveBeenCalled();

    fireEvent.blur(getByRole('textbox'));

    expect(onNameChange).toHaveBeenCalledTimes(1);
    expect(onNameChange).toHaveBeenCalledWith('text');
  });

  it('gets called when clicking enter in the input field', () => {
    const onNameChange = jest.fn();
    const { getByRole } = render(
      <Interactive {...defaultProps} onChangeName={onNameChange} />
    );

    expect(onNameChange).not.toHaveBeenCalled();

    userEvent.type(getByRole('textbox'), 'text');
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onNameChange).toHaveBeenCalledTimes(1);
    expect(onNameChange).toHaveBeenCalledWith('text');
  });
});

describe('readOnly prop', () => {
  it('disables input changes', () => {
    const { getByRole } = render(<Interactive {...defaultProps} name="text" />);
    userEvent.type(getByRole('textbox'), 'foo');
    fireEvent.blur(getByRole('textbox'));

    expect(getByRole('textbox')).toHaveValue('text');
  });
});
