/* eslint decipad/css-prop-named-variable: 0 */
import { SimpleTableCellType } from '@decipad/editor-types';
import { css } from '@emotion/react';
import pluralize from 'pluralize';
import { FC, useMemo } from 'react';
import { PaginationControl, Table } from '..';
import { TableHeader } from '../../atoms';
import { useMaterializedResult } from '../../hooks/useMaterializedResult';
import { TableHeaderRow, TableRow } from '../../molecules';
import { cssVar, p13Regular } from '../../primitives';
import { deciOverflowStyles } from '../../styles/scrollbars';
import { tableControlWidth } from '../../styles/table';
import { CodeResultProps } from '../../types';
import { isTabularType, toTableHeaderType } from '../../utils';
import { usePagination } from '../../utils/usePagination';
import {
  tableOverflowStyles,
  tableWrapperStyles,
} from '../EditorTable/EditorTable';
import { TableColumnHeader } from '../TableColumnHeader/TableColumnHeader';
import { TableResultCell } from './TableResultCell';

const MAX_ROWS_PER_PAGE = 10;

const liveTableWrapperStyles = css({
  left: '20px',
});

const liveTableOverflowStyles = css({
  minWidth: `calc(((${cssVar(
    'editorWidth'
  )} - 700px) / 2) - (${tableControlWidth}px * -2))`,
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
  padding: '0 8px',
});

const footerRowStyles = css({
  backgroundColor: cssVar('tableFooterBackgroundColor'),
});

type TableResultProps =
  | CodeResultProps<'table'>
  | CodeResultProps<'materialized-table'>;

export const TableResult: FC<TableResultProps> = ({
  parentType,
  type,
  value: _value,
  onDragStartCell,
  onDragEnd,
  tooltip = true,
  isLiveResult = false,
  // isNotEditable = false,
  firstTableRowControls,
  onChangeColumnType,
  element,
}) => {
  const value = useMaterializedResult(_value) as
    | undefined
    | CodeResultProps<'materialized-table'>['value'];

  const allowsForLookup =
    type.columnTypes && type.columnTypes[0]?.kind === 'string';

  const tableLength = value?.at(0)?.length ?? 0;

  const isNested = useMemo(() => isTabularType(parentType), [parentType]);

  if (
    value &&
    (!Array.isArray(value) ||
      !(value as Array<unknown>).every((col: unknown) => Array.isArray(col)))
  ) {
    console.error(value);
    throw new Error('invalid table value');
  }

  const { page, offset, presentRowCount, valuesForPage, setPage } =
    usePagination({
      all: value,
      maxRowsPerPage: MAX_ROWS_PER_PAGE,
    });

  if (tableLength == null) {
    return null;
  }

  return (
    <div
      css={[
        isLiveResult && tableWrapperStyles,
        isLiveResult && liveTableWrapperStyles,
        deciOverflowStyles, // cause of nested tables
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
            {type.columnNames?.map((columnName, index) =>
              isLiveResult ? (
                <TableColumnHeader
                  key={index}
                  type={toTableHeaderType(type.columnTypes[index])}
                  isFirst={index === 0}
                  isLiveResult
                  isForImportedColumn={isLiveResult}
                  onChangeColumnType={(columnType) =>
                    onChangeColumnType?.(
                      index,
                      columnType as SimpleTableCellType
                    )
                  }
                >
                  {columnName}
                </TableColumnHeader>
              ) : (
                <TableHeader
                  type={toTableHeaderType(type.columnTypes[index])}
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
            {value &&
              Array.from({ length: presentRowCount }, (_, rowIndex) => (
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
                      columnName={type.columnNames[colIndex]}
                      columnType={type.columnTypes[colIndex]}
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
          tableLength > MAX_ROWS_PER_PAGE && (
            <TableRow
              key="pagination"
              readOnly={true}
              tableCellControls={false}
            >
              {isLiveResult && <th></th>}
              <td
                css={[paginationControlWrapperTdStyles, footerRowStyles]}
                colSpan={type.columnNames.length}
              >
                <PaginationControl
                  page={page}
                  onPageChange={setPage}
                  startAt={1}
                  maxPages={Math.ceil(tableLength / MAX_ROWS_PER_PAGE)}
                >
                  <span css={pageDescriptionStyles}>
                    {tableLength} {pluralize('row', tableLength)}
                    {`, previewing rows ${offset + 1} to ${
                      offset + presentRowCount
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
