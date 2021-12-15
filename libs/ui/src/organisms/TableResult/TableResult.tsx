import { FC } from 'react';
import { css } from '@emotion/react';
import { Type } from '@decipad/language';
import { CodeResult, Table } from '..';
import { ResultTypeProps } from '../../lib/results';
import { TableCellType } from '../EditorTable/types';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';

const cellWrapperStyles = css({
  overflowX: 'hidden',
  padding: `2px ${table.cellSidePadding}`,
});

export function toTableHeaderType(type: Type): TableCellType {
  switch (true) {
    case type.type === 'number':
      return 'number';
    case type.type === 'string':
      return 'string';
    case type.date === 'time':
      return 'date/time';
    case type.date === 'day':
      return 'date/day';
    case type.date === 'month':
      return 'date/month';
    case type.date === 'year':
      return 'date/year';
    default:
      return 'string' as never;
  }
}

export const TableResult = ({
  type,
  value,
}: ResultTypeProps): ReturnType<FC> => {
  const { columnNames, columnTypes } = type;
  if (!columnNames || !columnTypes) {
    return null;
  }

  if (value == null || value.length === 0) {
    return null;
  }

  const tableLength = value[0].length;

  return (
    <Table>
      <thead>
        <TableHeaderRow readOnly>
          {columnNames?.map((columnName, index) => (
            <TableHeader
              key={index}
              type={toTableHeaderType(columnTypes[index])}
            >
              {columnName}
            </TableHeader>
          ))}
        </TableHeaderRow>
      </thead>
      <tbody>
        {Array.from({ length: tableLength }, (_, rowIndex) => (
          <TableRow key={rowIndex} readOnly>
            {value.map((column: unknown[], colIndex: number) => (
              <TableData key={colIndex}>
                <div css={cellWrapperStyles}>
                  <CodeResult
                    parentType={type}
                    type={columnTypes[colIndex]}
                    value={column[rowIndex]}
                    variant="block"
                  />
                </div>
              </TableData>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};
