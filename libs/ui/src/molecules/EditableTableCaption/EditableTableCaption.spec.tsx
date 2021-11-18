import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditableTableCaption } from './EditableTableCaption';

it('renders the text', () => {
  const { getByRole } = render(
    <table>
      <EditableTableCaption value="TableName" />
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
  expect(getByRole('textbox')).toHaveValue('TableName');
});

describe('onChange prop', () => {
  it('gets called only when new text is submitted', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <EditableTableCaption onChange={onChange} value="TableName" />
      </table>
    );

    userEvent.type(getByRole('textbox'), 'Edited');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('TableNameEdited');
  });

  it('ignores white spaces', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <EditableTableCaption onChange={onChange} value="TableName" />
      </table>
    );

    userEvent.type(getByRole('textbox'), '       Edited');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('TableNameEdited');
  });
});
