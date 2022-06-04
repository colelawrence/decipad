import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { SerializedTypes } from '@decipad/language';
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
  onDragStartCell,
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

  const [grabbing, setGrabbing] = useState(false);

  const tableLength = value[0].length;

  return (
    <Table border={isTabularType(parentType) ? 'inner' : 'all'}>
      <thead>
        <TableHeaderRow actionsColumn={false} readOnly>
          {columnNames?.map((columnName, index) => (
            <TableHeader
              type={toTableHeaderType(columnTypes[index])}
              key={index}
              isEditable={false}
              showIcon={false}
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
              <TableData
                key={colIndex}
                as="td"
                isEditable={false}
                showPlaceholder={false}
                draggable
                grabbing={grabbing}
                onDragStart={(e) => {
                  onDragStartCell?.({
                    tableName: (type as SerializedTypes.Table)
                      .indexName as string,
                    columnName: columnNames[colIndex],
                    cellValue: value[0][rowIndex] as string,
                  })(e);

                  setGrabbing(true);
                }}
                onDragEnd={() => setGrabbing(false)}
              >
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
