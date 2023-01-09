import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeResult, Table } from '..';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';

export const RowResult = ({
  parentType,
  type,
  value,
  element,
}: CodeResultProps<'row'>): ReturnType<FC> => {
  const { rowCellNames, rowCellTypes } = type;
  return (
    <Table
      isReadOnly={true}
      columnCount={1}
      border={isTabularType(parentType) ? 'inner' : 'all'}
      head={
        <TableHeaderRow readOnly>
          {rowCellNames.map((columnName, colIndex) => (
            <TableHeader
              type={toTableHeaderType(rowCellTypes[colIndex])}
              key={colIndex}
              showIcon={false}
            >
              {columnName}
            </TableHeader>
          ))}
        </TableHeaderRow>
      }
      body={
        <TableRow readOnly>
          {value.map((col, colIndex) => {
            return (
              <TableData
                as="td"
                key={colIndex}
                showPlaceholder={false}
                element={element}
              >
                <div
                  css={[
                    css(table.getCellWrapperStyles(rowCellTypes[colIndex])),
                    colIndex === 0 && table.cellLeftPaddingStyles,
                  ]}
                >
                  <CodeResult
                    parentType={type}
                    type={rowCellTypes[colIndex]}
                    value={col}
                    variant="block"
                    element={element}
                  />
                </div>
              </TableData>
            );
          })}
        </TableRow>
      }
    />
  );
};
