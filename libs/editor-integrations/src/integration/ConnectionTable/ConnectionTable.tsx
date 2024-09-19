import { formatResultPreview } from '@decipad/format';
import { all, count } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';
import { Result } from '@decipad/remote-computer';
import { PaginationControl, getTypeIcon } from '@decipad/ui';
import { FC, memo, useMemo, useState } from 'react';
import { StyledFooter, StyledTable, TableWrapper } from './styles';

export type ConnectionTableProps = {
  tableResult: Result.Result<'table'>;
};

const PAGE_SIZE = 10;

const getHtmlRows = (
  table: Result.Result<'table'>,
  columns: Array<Result.ResultMaterializedColumn>
): Array<Array<string>> => {
  const rows: Array<Array<string>> = [];

  for (let i = 0; i < columns[0].length; i++) {
    const row: Array<string> = [];
    for (let j = 0; j < columns.length; j++) {
      row.push(
        formatResultPreview({
          type: table.type.columnTypes[j],
          value: columns[j][i]!,
        })
      );
    }
    rows.push(row);
  }

  return rows;
};

/**
 * A result component that assumes that a table is grid.
 * This table will not support nested columns, nested tables.
 *
 * It is optimizised by using `display: table` which allows the browser to
 * do a bunch of optimisations when it comes to rendering.
 */
const UnmemoedConnectionTable: FC<ConnectionTableProps> = ({ tableResult }) => {
  const [page, setPage] = useState(1);

  const htmlRows = useResolved(
    useMemo(async () => {
      const rows = await Promise.all(
        tableResult.value.map((column) =>
          all(column((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
        )
      );

      return getHtmlRows(tableResult, rows);
    }, [page, tableResult])
  );

  const rowCount = useResolved(
    useMemo(async () => {
      if (tableResult.type.rowCount != null) {
        return tableResult.type.rowCount;
      }

      const firstColumn = tableResult.value[0];

      return count(firstColumn());
    }, [tableResult.type.rowCount, tableResult.value])
  );

  if (htmlRows == null || rowCount == null) {
    return null;
  }

  return (
    <TableWrapper>
      <StyledTable contentEditable={false}>
        <thead>
          <tr>
            {tableResult.type.columnNames.map((columnName, i) => {
              const Icon = getTypeIcon(tableResult.type.columnTypes[i]);
              return (
                <th key={columnName} scope="col">
                  <span>
                    <Icon /> <span>{columnName}</span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {htmlRows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <StyledFooter>
          <tr>
            <td colSpan={tableResult.value.length}>
              <div>
                <PaginationControl
                  startAt={1}
                  maxPages={Math.ceil(rowCount / PAGE_SIZE)}
                  page={page}
                  onPageChange={setPage}
                />
                <span>
                  {rowCount} rows, previewing rows {(page - 1) * PAGE_SIZE + 1}{' '}
                  to {page * PAGE_SIZE}
                </span>
              </div>
            </td>
          </tr>
        </StyledFooter>
      </StyledTable>
    </TableWrapper>
  );
};

export const ConnectionTable = memo(UnmemoedConnectionTable);
