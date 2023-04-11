import { useState, useMemo, FC } from 'react';
import { css } from '@emotion/react';
import pluralize from 'pluralize';
import { PaginationControl, Table } from '..';
import { TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { tableControlWidth } from '../../styles/table';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';
import {
  tableOverflowStyles,
  tableWrapperStyles,
} from '../EditorTable/EditorTable';
import { TableColumnHeader } from '../TableColumnHeader/TableColumnHeader';
import { TableResultCell } from './TableResultCell';
import { cssVar, p13Regular } from '../../primitives';

const MAX_ROWS_PER_PAGE = 10;

const liveTableWrapperStyles = css({
  left: '20px',
});

const liveTableOverflowStyles = css({
  minWidth: `calc(((100vw - 700px) / 2) - (${tableControlWidth} * -2))`,
});

const liveTableEmptyCellStyles = css({
  border: 0,
});

const paginationControlWrapperTdStyles = css({
  border: 0,
  padding: '6px 8px 6px 12px',
});

const pageDescriptionStyles = css(p13Regular, {
  color: cssVar('normalTextColor'),
});

const footerRowStyles = css({
  backgroundColor: cssVar('tableFooterBackgroundColor'),
});

export const TableResult = ({
  parentType,
  type: _type,
  value: _value,
  onDragStartCell,
  onDragEnd,
  tooltip = true,
  isLiveResult = false,
  firstTableRowControls,
  onChangeColumnType,
  element,
}: CodeResultProps<'table'>): ReturnType<FC> => {
  const result = useMemo(
    () => ({ type: _type, value: _value }),
    [_type, _value]
  );

  const { type, value } = result;

  const { columnNames, columnTypes } = type;

  const allowsForLookup = columnTypes && columnTypes[0]?.kind === 'string';

  if (value.length !== columnNames.length) {
    throw new Error(
      `There are ${columnNames.length} column names. Expected values for ${columnNames.length} columns, but received values for ${value.length} columns.`
    );
  }

  const tableLength = value.at(0)?.length;

  const isNested = useMemo(() => isTabularType(parentType), [parentType]);

  // pagination
  const [page, setPage] = useState(1);
  const totalRowCount = useMemo(() => value[0]?.length, [value]);
  const rowOffset = useMemo(() => (page - 1) * MAX_ROWS_PER_PAGE, [page]);
  const presentRowCount = Math.min(
    totalRowCount - rowOffset,
    MAX_ROWS_PER_PAGE
  );
  const valuesForPage = useMemo(
    () =>
      value.map((col) => col.slice(rowOffset, rowOffset + MAX_ROWS_PER_PAGE)),
    [rowOffset, value]
  );

  if (tableLength == null) {
    return null;
  }

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
        border={isNested ? 'inner' : 'all'}
        isReadOnly={!isLiveResult}
        isLiveResult={isLiveResult}
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
                  isEditable={false}
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
            {Array.from({ length: presentRowCount }, (_, rowIndex) => (
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
                {valuesForPage.map((column, colIndex) => (
                  <TableResultCell
                    key={colIndex}
                    cellValue={column[rowIndex]}
                    colIndex={colIndex}
                    isLiveResult={isLiveResult}
                    allowsForLookup={allowsForLookup}
                    onDragStartCell={onDragStartCell}
                    onDragEnd={onDragEnd}
                    tableType={type}
                    columnName={columnNames[colIndex]}
                    columnType={columnTypes[colIndex]}
                    value={value[0][rowIndex] as string}
                    element={element}
                    tooltip={tooltip}
                  />
                ))}
              </TableRow>
            ))}
          </>
        }
        footer={
          totalRowCount > MAX_ROWS_PER_PAGE && (
            <TableRow
              key="pagination"
              readOnly={true}
              tableCellControls={false}
            >
              <th></th>
              <td
                css={[paginationControlWrapperTdStyles, footerRowStyles]}
                colSpan={columnNames.length}
              >
                <PaginationControl
                  page={page}
                  onPageChange={setPage}
                  startAt={1}
                  maxPages={Math.ceil(totalRowCount / MAX_ROWS_PER_PAGE)}
                >
                  <span css={pageDescriptionStyles}>
                    {totalRowCount} {pluralize('row', totalRowCount)}
                    {`, previewing rows ${rowOffset + 1} to ${
                      rowOffset + presentRowCount
                    }`}
                  </span>
                </PaginationControl>
              </td>
            </TableRow>
          )
        }
      ></Table>
    </div>
  );
};
