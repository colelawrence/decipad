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

  it('ignores characters that fail the identifier pattern', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <EditableTableCaption onChange={onChange} value="" />
      </table>
    );

    // See https://www.ptiglobal.com/2018/04/26/the-beauty-of-unicode-zero-width-characters/ and
    // the `libs/ui/src/utils/language.ts` file.
    userEvent.type(
      getByRole('textbox'),
      '##123\u200B\u200C\u200D\u2060\uFEFF!#,...-$Edite   d123'
    );

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('$Edited123');
  });
});
