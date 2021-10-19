import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditableCellContents } from './EditableCellContents';

describe('Cell contents', () => {
  it('renders the cell text', () => {
    const { getByRole } = render(<EditableCellContents value="Inner text" />);

    expect(getByRole('textbox')).toBeVisible();
  });

  it('submits a new value when blurring', async () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <EditableCellContents value="text" onChange={onChange} />
    );

    userEvent.type(getByRole('textbox'), ' newtext');
    fireEvent.blur(getByRole('textbox'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('text newtext');
  });

  it('takes a new value from the props', async () => {
    const { getByRole, rerender } = render(
      <EditableCellContents value="old" />
    );

    const text = () => (getByRole('textbox') as HTMLInputElement).value;

    expect(text()).toEqual('old');

    rerender(<EditableCellContents value="new" />);

    expect(text()).toEqual('new');
  });
});
