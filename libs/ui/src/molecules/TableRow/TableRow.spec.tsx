import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableData } from '../../atoms';
import { TableRow } from './TableRow';

it('renders a table data', () => {
  render(
    <table>
      <tbody>
        <TableRow>
          <td>
            <TableData>Table Data</TableData>
          </td>
        </TableRow>
      </tbody>
    </table>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});

it('renders the remove row button', () => {
  render(
    <table>
      <tbody>
        <TableRow>
          <td>
            <TableData>Table Data</TableData>
          </td>
        </TableRow>
      </tbody>
    </table>
  );

  expect(screen.getByTitle(/minus/i).closest('button')!).toBeVisible();
});

describe('onRemove prop', () => {
  it('gets called when the remove button is pressed', async () => {
    const onRemove = jest.fn();
    render(
      <table>
        <tbody>
          <TableRow onRemove={onRemove}>
            <td>
              <TableData>Table Data</TableData>
            </td>
          </TableRow>
        </tbody>
      </table>
    );

    await userEvent.click(screen.getByTitle(/minus/i).closest('button')!);

    expect(onRemove).toHaveBeenCalled();
  });
});

describe('readOnly prop', () => {
  it('does not render the actions column', () => {
    const { rerender } = render(
      <table>
        <tbody>
          <TableRow>
            <td>
              <TableData>Table Data</TableData>
            </td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getAllByRole('cell')).toHaveLength(2);

    rerender(
      <table>
        <tbody>
          <TableRow readOnly>
            <td>
              <TableData>Table Data</TableData>
            </td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getAllByRole('cell')).toHaveLength(1);
  });
});
