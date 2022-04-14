import { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditableTableData } from './EditableTableData';

const props: ComponentProps<typeof EditableTableData> = {
  value: 'Table Data',
};

it('renders the text', () => {
  const { getByRole } = render(
    <table>
      <tbody>
        <tr>
          <EditableTableData {...props} />
        </tr>
      </tbody>
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
  expect(getByRole('textbox')).toHaveValue('Table Data');
});

describe('onChange prop', () => {
  it('gets called only when new text is submitted', async () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <tbody>
          <tr>
            <EditableTableData {...props} onChange={onChange} />
          </tr>
        </tbody>
      </table>
    );

    await userEvent.type(getByRole('textbox'), ' Edited');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Table Data Edited');
  });
});
