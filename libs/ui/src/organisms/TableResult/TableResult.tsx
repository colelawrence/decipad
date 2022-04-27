import { FC } from 'react';
import { css } from '@emotion/react';
import { CodeResult, Table } from '..';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';

export const TableResult = ({
  parentType,
  type,
  value,
}: CodeResultProps<'table'>): ReturnType<FC> => {
  const { columnNames, columnTypes } = type;
  if (!columnNames.length) {
    throw new Error('Cannot render table with zero columns');
  }
  if (value.length !== columnNames.length) {
    throw new Error(
      `There are ${columnNames.length} column names. Expected values for ${columnNames.length} columns, but received values for ${value.length} columns.`
    );
  }

  const tableLength = value[0].length;

  return (
    <Table border={isTabularType(parentType) ? 'inner' : 'all'}>
      <thead>
        <TableHeaderRow actionsColumn={false} readOnly>
          {columnNames?.map((columnName, index) => (
            <TableHeader
              type={toTableHeaderType(columnTypes[index])}
              key={index}
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
              <TableData key={colIndex} as="td">
                <div
                  css={[
                    css(table.getCellWrapperStyles(columnTypes[colIndex])),
                    colIndex === 0 && table.cellLeftPaddingStyles,
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
