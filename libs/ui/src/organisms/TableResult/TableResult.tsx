import { css } from '@emotion/react';
import { FC, useMemo, useState } from 'react';
import { SerializedTypes } from '@decipad/language';
import { CodeResult, Table } from '..';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';
import { defaultMaxRows, tableParentStyles } from '../../styles/table';
import { table } from '../../styles';

const recursiveRowCount = (t: Array<unknown>): number => {
  return t
    .map((result) => {
      if (Array.isArray(result)) {
        return recursiveRowCount(result);
      }
      return 1;
    })
    .reduce((sum, n) => sum + n, 0);
};

export const TableResult = ({
  parentType,
  type,
  value,
  onDragStartCell,
  tooltip = true,
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
  const [showAllRows, setShowAllRows] = useState(false);

  const tableLength = value[0].length;

  const tableRecursiveLength = useMemo(
    () => Math.max(...value.map((col) => recursiveRowCount(col))) as number,
    [value]
  );

  const isNested = useMemo(() => isTabularType(parentType), [parentType]);

  const showRowLength = useMemo(() => {
    if (isNested || showAllRows) {
      return tableLength;
    }
    if (tableRecursiveLength < defaultMaxRows) {
      return tableRecursiveLength;
    }
    if (tableRecursiveLength === tableLength) {
      return Math.min(defaultMaxRows, tableLength);
    }
    const recursiveShowLength = tableRecursiveLength - defaultMaxRows;
    const proportionOfTableToHide = recursiveShowLength / tableRecursiveLength;
    const hideRows = Math.max(
      Math.floor(tableLength * proportionOfTableToHide),
      1
    );
    return tableLength - hideRows;
  }, [isNested, showAllRows, tableLength, tableRecursiveLength]);

  const hiddenRowCount = useMemo(
    () => tableLength - showRowLength,
    [showRowLength, tableLength]
  );

  return (
    <Table
      columnCount={columnNames.length}
      border={isNested ? 'inner' : 'all'}
      translateX
      hiddenRowCount={hiddenRowCount}
      setShowAllRows={setShowAllRows}
      isReadOnly={true}
      head={
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
      }
      body={
        <>
          {Array.from({ length: showRowLength }, (_, rowIndex) => (
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
                  lastBeforeMoreRowsHidden={
                    hiddenRowCount > 0 && rowIndex === showRowLength - 1
                  }
                  css={{ ...tableParentStyles }}
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
                      tooltip={tooltip}
                    />
                  </div>
                </TableData>
              ))}
            </TableRow>
          ))}
        </>
      }
    ></Table>
  );
};
