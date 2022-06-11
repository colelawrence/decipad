import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableHeader } from '../../atoms';
import { TableColumnHeader } from '../../organisms';
import { getStringType } from '../../utils';
import { TableHeaderRow } from './TableHeaderRow';

it('renders a table data', () => {
  render(
    <table>
      <tbody>
        <TableHeaderRow>
          <TableHeader type={getStringType()}>Table Data</TableHeader>
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});

it('renders the add new column button', () => {
  render(
    <table>
      <tbody>
        <TableHeaderRow>
          <TableColumnHeader readOnly={false} type={getStringType()} />
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(screen.getByTitle(/create/i).closest('svg')).toBeVisible();
});

describe('onAddColumn prop', () => {
  it('gets called when the add new column button is clicked', async () => {
    const onAddColumn = jest.fn();
    render(
      <table>
        <tbody>
          <TableHeaderRow onAddColumn={onAddColumn}>
            <TableColumnHeader readOnly={false} type={getStringType()} />
          </TableHeaderRow>
        </tbody>
      </table>
    );

    await userEvent.click(screen.getByTitle(/create/i).closest('svg')!);

    expect(onAddColumn).toHaveBeenCalled();
  });
});

describe('actionsColumn prop', () => {
  it('renders the actions column by default', () => {
    render(
      <table>
        <tbody>
          <TableHeaderRow>
            <TableHeader type={getStringType()}>Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  describe('when false', () => {
    it('does not render the actions column', () => {
      render(
        <table>
          <tbody>
            <TableHeaderRow actionsColumn={false}>
              <TableHeader type={getStringType()}>Table Data</TableHeader>
            </TableHeaderRow>
          </tbody>
        </table>
      );

      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    });
  });
});

describe('readOnly prop', () => {
  it('does not render the add new column button on the actions column', () => {
    render(
      <table>
        <tbody>
          <TableHeaderRow readOnly>
            <TableHeader type={getStringType()}>Table Data</TableHeader>
          </TableHeaderRow>
        </tbody>
      </table>
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.queryByTitle(/create/i)).not.toBeInTheDocument();
  });
});
