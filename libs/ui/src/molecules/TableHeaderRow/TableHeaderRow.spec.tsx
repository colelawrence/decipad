import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableHeader } from '../../atoms';
import { EditableTableHeader } from '../../organisms';
import { TableHeaderRow } from './TableHeaderRow';

it('renders a table data', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <TableHeaderRow>
          <TableHeader type="string">Table Data</TableHeader>
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(getByText('Table Data')).toBeVisible();
});

it('renders an editable table data', () => {
  const { getByRole } = render(
    <table>
      <tbody>
        <TableHeaderRow>
          <EditableTableHeader type="string" value="Table Data" />
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
});

it('renders the add new column button', () => {
  const { getByTitle } = render(
    <table>
      <tbody>
        <TableHeaderRow>
          <EditableTableHeader type="string" value="Table Data" />
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(getByTitle(/create/i).closest('svg')).toBeVisible();
});

describe('onAddColumn prop', () => {
  it('gets called when the add new column button is clicked', () => {
    const onAddColumn = jest.fn();
    const { getByTitle } = render(
      <table>
        <tbody>
          <TableHeaderRow onAddColumn={onAddColumn}>
            <TableHeader type="string">Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    userEvent.click(getByTitle(/create/i).closest('svg')!);

    expect(onAddColumn).toHaveBeenCalled();
  });
});
