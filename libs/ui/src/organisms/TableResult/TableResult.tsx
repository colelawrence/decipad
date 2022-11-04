import { SerializedType, SerializedTypes } from '@decipad/computer';
import { css } from '@emotion/react';
import { FC, useMemo, useState } from 'react';
import { CodeResult, Table } from '..';
import { TableData, TableHeader } from '../../atoms';
import { DragHandle } from '../../icons/index';
import { TableHeaderRow, TableRow } from '../../molecules';
import { cssVar } from '../../primitives';
import { table } from '../../styles';
import {
  defaultMaxRows,
  tableControlWidth,
  tableParentStyles,
} from '../../styles/table';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';
import {
  tableOverflowStyles,
  tableWrapperStyles,
} from '../EditorTable/EditorTable';
import { TableColumnHeader } from '../TableColumnHeader/TableColumnHeader';

const recursiveRowCount = (t: SerializedType): number => {
  if (t.kind === 'table' && t.tableLength !== 'unknown') {
    return (
      Math.max(...t.columnTypes.map((ct) => recursiveRowCount(ct))) *
      t.tableLength
    );
  }
  if (t.kind === 'column' && t.columnSize !== 'unknown') {
    return recursiveRowCount(t.cellType) * t.columnSize;
  }
  return 1;
};

const liveTableWrapperStyles = css({
  left: '-40px',
});

const liveTableOverflowStyles = css({
  minWidth: `calc(((100vw - 700px) / 2) - (${tableControlWidth} * -2))`,
});

const liveTableEmptyCellStyles = css({
  border: 0,
});

export const TableResult = ({
  parentType,
  type,
  value,
  onDragStartCell,
  tooltip = true,
  isLiveResult = false,
  firstTableRowControls,
  onChangeColumnType,
}: CodeResultProps<'table'>): ReturnType<FC> => {
  const [showAllRows, setShowAllRows] = useState(false);
  const { columnNames, columnTypes } = type;
  if (value.length !== columnNames.length) {
    throw new Error(
      `There are ${columnNames.length} column names. Expected values for ${columnNames.length} columns, but received values for ${value.length} columns.`
    );
  }

  const handleSetShowALlRowsButtonPress = () => {
    setShowAllRows(true);
  };

  const tableLength =
    type.tableLength === 'unknown' ? value[0]?.length : type.tableLength;

  const tableRecursiveLength = useMemo(() => recursiveRowCount(type), [type]);

  const isNested = useMemo(() => isTabularType(parentType), [parentType]);

  const hiddenRowsCount = useMemo(() => {
    if (isNested || showAllRows || !tableLength) {
      return 0;
    }
    if (tableRecursiveLength <= defaultMaxRows) {
      return 0;
    }
    if (tableRecursiveLength === tableLength) {
      return tableLength - defaultMaxRows;
    }
    const recursiveShowLength = tableRecursiveLength - defaultMaxRows;
    const proportionOfTableToHide = recursiveShowLength / tableRecursiveLength;
    return Math.floor(tableLength * proportionOfTableToHide);
  }, [isNested, tableLength, showAllRows, tableRecursiveLength]);

  const showRowLength = useMemo(
    () => tableLength - hiddenRowsCount,
    [hiddenRowsCount, tableLength]
  );

  return (
    <div
      css={[
        isLiveResult && tableWrapperStyles,
        isLiveResult && liveTableWrapperStyles,
      ]}
    >
      <div
        css={[
          isLiveResult && tableOverflowStyles,
          isLiveResult && liveTableOverflowStyles,
        ]}
        contentEditable={false}
      />

      <Table
        columnCount={columnNames.length}
        border={isNested ? 'inner' : 'all'}
        hiddenRowCount={hiddenRowsCount}
        isReadOnly={!isLiveResult}
        isLiveResult={isLiveResult}
        handleSetShowALlRowsButtonPress={handleSetShowALlRowsButtonPress}
        head={
          <TableHeaderRow readOnly={!isLiveResult}>
            {columnNames?.map((columnName, index) =>
              isLiveResult ? (
                <TableColumnHeader
                  key={index}
                  type={toTableHeaderType(columnTypes[index])}
                  isFirst={index === 0}
                  isForImportedColumn={isLiveResult}
                  onChangeColumnType={(columnType) =>
                    onChangeColumnType?.(index, columnType)
                  }
                >
                  {columnName}
                </TableColumnHeader>
              ) : (
                <TableHeader
                  type={toTableHeaderType(columnTypes[index])}
                  key={index}
                  isEditable={!isLiveResult}
                  showIcon={isLiveResult}
                >
                  {columnName}
                </TableHeader>
              )
            )}
          </TableHeaderRow>
        }
        body={
          <>
            {Array.from({ length: showRowLength }, (_, rowIndex) => (
              <TableRow
                key={rowIndex}
                readOnly={!isLiveResult || rowIndex > 0}
                tableCellControls={
                  (isLiveResult && rowIndex === 0 && firstTableRowControls) ||
                  (isLiveResult && <th></th>) ||
                  false
                }
              >
                {isLiveResult && rowIndex > 0 && (
                  <th css={liveTableEmptyCellStyles}></th>
                )}
                {value.map((column, colIndex) => (
                  <TableData
                    key={colIndex}
                    as="td"
                    isEditable={false}
                    isLiveResult={isLiveResult}
                    showPlaceholder={false}
                    lastBeforeMoreRowsHidden={
                      hiddenRowsCount > 0 && rowIndex === showRowLength - 1
                    }
                    css={{ ...tableParentStyles }}
                    draggable={!!onDragStartCell}
                    firstChildren={
                      <div
                        draggable
                        onDragStart={(e) => {
                          onDragStartCell?.({
                            tableName: (type as SerializedTypes.Table)
                              .indexName as string,
                            columnName: columnNames[colIndex],
                            cellValue: value[0][rowIndex] as string,
                          })(e);
                        }}
                        className={onDragStartCell && 'drag-handle'}
                        css={{
                          display: 'none',
                          position: 'absolute',
                          top: 8,
                          right: 4,
                          zIndex: 1,
                          height: 18,
                          width: 18,
                          borderRadius: 6,
                          ':hover': {
                            background: cssVar('highlightColor'),
                          },
                        }}
                      >
                        <button
                          css={{
                            width: '8px',
                            height: 9,
                            transform: 'translateY(50%)',
                            display: 'block',
                            margin: 'auto',
                            cursor: 'grab',
                          }}
                        >
                          <DragHandle />
                        </button>
                      </div>
                    }
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
                        isLiveResult={isLiveResult}
                      />
                    </div>
                  </TableData>
                ))}
              </TableRow>
            ))}
          </>
        }
      ></Table>
    </div>
  );
};
