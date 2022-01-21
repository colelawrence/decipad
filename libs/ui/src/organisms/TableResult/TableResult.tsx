import { FC } from 'react';
import { css } from '@emotion/react';
import { SerializedType } from '@decipad/language';
import { CodeResult, Table } from '..';
import { TableCellType } from '../EditorTable/types';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';

const cellWrapperStyles = css({
  overflowX: 'hidden',
  padding: `2px ${table.cellSidePadding}`,
});

function toTableHeaderType(type: SerializedType): TableCellType {
  switch (true) {
    case type.kind === 'number':
      return 'number';
    case type.kind === 'string':
      return 'string';
    case type.kind === 'date' && type.date === 'day':
      return 'date/day';
    case type.kind === 'date' && type.date === 'month':
      return 'date/month';
    case type.kind === 'date' && type.date === 'year':
      return 'date/year';
    case type.kind === 'date':
      return 'date/time';
    default:
      return 'string' as never;
  }
}

export const TableResult = ({
  type,
  value,
}: CodeResultProps<'table'>): ReturnType<FC> => {
  const { columnNames, columnTypes } = type;
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
            {value.map((column, colIndex) => (
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
