import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTableData } from '..';
import { TableData } from '../../atoms';
import { TableRow } from './TableRow';

it('renders a table data', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <TableRow>
          <TableData>Table Data</TableData>
        </TableRow>
      </tbody>
    </table>
  );

  expect(getByText('Table Data')).toBeVisible();
});

it('renders an editable table data', () => {
  const { getByRole } = render(
    <table>
      <tbody>
        <TableRow>
          <EditableTableData value="Table Data" />
        </TableRow>
      </tbody>
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
});

it('renders the remove row button', () => {
  const { getByTitle } = render(
    <table>
      <tbody>
        <TableRow>
          <TableData>Table Data</TableData>
        </TableRow>
      </tbody>
    </table>
  );

  expect(getByTitle(/minus/i).closest('button')!).toBeVisible();
});

describe('onRemove prop', () => {
  it('gets called when the remove button is pressed', async () => {
    const onRemove = jest.fn();
    const { getByTitle } = render(
      <table>
        <tbody>
          <TableRow onRemove={onRemove}>
            <TableData>Table Data</TableData>
          </TableRow>
        </tbody>
      </table>
    );

    await userEvent.click(getByTitle(/minus/i).closest('button')!);

    expect(onRemove).toHaveBeenCalled();
  });
});

describe('readOnly prop', () => {
  it('does not render the actions column', () => {
    const { getAllByRole, rerender } = render(
      <table>
        <tbody>
          <TableRow>
            <TableData>Table Data</TableData>
          </TableRow>
        </tbody>
      </table>
    );

    expect(getAllByRole('cell')).toHaveLength(2);

    rerender(
      <table>
        <tbody>
          <TableRow readOnly>
            <TableData>Table Data</TableData>
          </TableRow>
        </tbody>
      </table>
    );

    expect(getAllByRole('cell')).toHaveLength(1);
  });
});
