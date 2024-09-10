/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import pluralize from 'pluralize';
import { SimpleTableCellType } from '@decipad/editor-types';
import { usePagination, useResolved } from '@decipad/react-utils';
import {
  Result,
  getResultGenerator,
  isResultGenerator,
} from '@decipad/remote-computer';
import { all as allElements, count } from '@decipad/generator-utils';
import { PaginationControl } from '../../../shared';
import { Table } from '../Table/Table';
import { TableHeader } from '../TableHeader/TableHeader';
import { TableHeaderRow } from '../TableHeaderRow/TableHeaderRow';
import { TableColumnHeader } from '../TableColumnHeader/TableColumnHeader';
import { TableRow } from '../TableRow/TableRow';
import { cssVar, p13Regular } from '../../../primitives';
import { deciOverflowStyles } from '../../../styles/scrollbars';
import { tableControlWidth } from '../../../styles/table';
import { CodeResultProps } from '../../../types';
import { isTabularType, toTableHeaderType } from '../../../utils';
import {
  tableOverflowStyles,
  tableWrapperStyles,
} from '../EditorTable/EditorTable';
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
  color: cssVar('textDefault'),
  padding: '0 8px',
});

const footerRowStyles = css({
  backgroundColor: cssVar('backgroundSubdued'),
});

type TableResultProps =
  | CodeResultProps<'table'>
  | CodeResultProps<'materialized-table'>;

const isTableValue = (
  value: Result.OneResult
): value is Result.ResultTable | Result.ResultMaterializedTable =>
  Array.isArray(value) &&
  (value as Array<Result.OneResult>).every(
    (column) => Array.isArray(column) || isResultGenerator(column)
  );

// this component is cursed
export const TableResult: FC<TableResultProps> = ({
  parentType,
  type,
  value: _value,
  meta,
  onDragStartCell,
  onDragEnd,
  onHideColumn,
  tooltip = true,
  isLiveResult = false,
  firstTableRowControls,
  onChangeColumnType,
  isResultPreview,
  element,
}) => {
  const allowsForLookup =
    type.columnTypes && type.columnTypes[0]?.kind === 'string';

  const isExpectedValueType = useMemo(
    () => isTableValue(_value) && _value.length > 0,
    [_value]
  );

  const all = useMemo(
    () =>
      (isExpectedValueType
        ? (_value as Result.ResultMaterializedTable).map(getResultGenerator)
        : []) as Result.ResultTable,
    [_value, isExpectedValueType]
  );

  const tableLength =
    useResolved(
      useMemo(
        () =>
          isExpectedValueType
            ? type.rowCount ?? count(all[0]())
            : Promise.resolve(0),
        [isExpectedValueType, type.rowCount, all]
      )
    ) ?? 0;
  const isNested = useMemo(() => isTabularType(parentType), [parentType]);

  const { page, offset, presentRowCount, valuesForPage, setPage } =
    usePagination(
      useMemo(
        () => ({
          all,
          totalRowCount: tableLength,
          maxRowsPerPage: MAX_ROWS_PER_PAGE,
        }),
        [all, tableLength]
      )
    );

  const materializedValuesForPage = useResolved(
    useMemo(
      () => Promise.all(valuesForPage.map((col) => allElements(col()))),
      [valuesForPage]
    )
  );

  return (
    <div
      css={
        !isResultPreview && [
          isLiveResult && tableWrapperStyles,
          isLiveResult && liveTableWrapperStyles,
          deciOverflowStyles, // cause of nested tables
        ]
      }
    >
      {!isResultPreview && (
        <div
          css={[
            isLiveResult && tableOverflowStyles,
            isLiveResult && liveTableOverflowStyles,
          ]}
          contentEditable={false}
        />
      )}
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
                  isLiveResult={!isResultPreview}
                  isForImportedColumn={isLiveResult}
                  onHideColumn={
                    onHideColumn == null
                      ? undefined
                      : () => onHideColumn(columnName)
                  }
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
            {materializedValuesForPage &&
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
                  {materializedValuesForPage.map((column, colIndex) => (
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
                      value={
                        materializedValuesForPage?.[0][rowIndex]?.toString() ??
                        ''
                      }
                      meta={meta}
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
