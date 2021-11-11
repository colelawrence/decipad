import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditableTableCaption } from './EditableTableCaption';

it('renders the text', () => {
  const { getByRole } = render(
    <table>
      <EditableTableCaption value="Table Name" />
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
  expect(getByRole('textbox')).toHaveValue('Table Name');
});

describe('onChange prop', () => {
  it('gets called only when new text is submitted', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <EditableTableCaption onChange={onChange} value="Table Name" />
      </table>
    );

    userEvent.type(getByRole('textbox'), ' Edited');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Table Name Edited');
  });
});
