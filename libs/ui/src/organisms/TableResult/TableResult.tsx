import { FC } from 'react';
import { css } from '@emotion/react';
import { SerializedType } from '@decipad/language';
import { CodeResult, Table } from '..';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';
import { CodeResultProps, TableCellType } from '../../types';
import { isTabularType } from '../../utils';

const cellWrapperStyles = css({
  overflowX: 'hidden',
  display: 'grid',
});

const cellSidePadding = css({
  padding: `2px ${table.cellSidePadding}`,
});

const cellLeftPaddingStyles = css({
  paddingLeft: table.cellSidePadding,
});

export function toTableHeaderType(
  type: SerializedType
): TableCellType | undefined {
  switch (type.kind) {
    case 'number':
    case 'string':
    case 'date':
      return type;
    default:
      return undefined as never;
  }
}

export const TableResult = ({
  parentType,
  type,
  value,
}: CodeResultProps<'table'>): ReturnType<FC> => {
  const { columnNames, columnTypes } = type;
  const tableLength = value[0].length;

  return (
    <Table border={isTabularType(parentType) ? 'inner' : 'all'}>
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
                <div
                  css={[
                    cellWrapperStyles,
                    !isTabularType(columnTypes[colIndex]) && cellSidePadding,
                    colIndex === 0 && cellLeftPaddingStyles,
                  ]}
                >
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
