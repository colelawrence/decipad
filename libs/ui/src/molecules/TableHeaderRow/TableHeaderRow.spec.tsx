import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableHeader } from '../../atoms';
import { getStringType } from '../../utils';
import { EditableTableHeader } from '../../organisms';
import { TableHeaderRow } from './TableHeaderRow';

it('renders a table data', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <TableHeaderRow>
          <TableHeader type={getStringType()}>Table Data</TableHeader>
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
          <EditableTableHeader type={getStringType()} value="Table Data" />
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
          <EditableTableHeader type={getStringType()} value="Table Data" />
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
            <TableHeader type={getStringType()}>Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    userEvent.click(getByTitle(/create/i).closest('svg')!);

    expect(onAddColumn).toHaveBeenCalled();
  });
});

describe('actionsColumn prop', () => {
  it('renders the actions column by default', () => {
    const { getAllByRole } = render(
      <table>
        <tbody>
          <TableHeaderRow>
            <TableHeader type={getStringType()}>Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    expect(getAllByRole('columnheader')).toHaveLength(2);
  });

  describe('when false', () => {
    it('does not render the actions column', () => {
      const { getAllByRole } = render(
        <table>
          <tbody>
            <TableHeaderRow actionsColumn={false}>
              <TableHeader type={getStringType()}>Table Data</TableHeader>
            </TableHeaderRow>
          </tbody>
        </table>
      );

      expect(getAllByRole('columnheader')).toHaveLength(1);
    });
  });
});

describe('readOnly prop', () => {
  it('does not render the add new column button on the actions column', () => {
    const { getAllByRole, queryByTitle } = render(
      <table>
        <tbody>
          <TableHeaderRow readOnly>
            <TableHeader type={getStringType()}>Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    expect(getAllByRole('columnheader')).toHaveLength(2);
    expect(queryByTitle(/create/i)).not.toBeInTheDocument();
  });
});
