import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar } from '../../primitives';
import {
  AddTableRowButton,
  EditableTableCaption,
  EditableTableData,
  TableHeaderRow,
  TableRow,
} from '../../molecules';
import { EditableTableHeader } from '../index';
import { TableCellType, TableColumn, TableData } from './types';
import { noop, tableRowCounter } from '../../utils';

const border = `1px solid ${cssVar('strongHighlightColor')}`;
const borderRadius = '6px';

const tableStyles = css({
  borderCollapse: 'inherit',
  borderSpacing: '0',
  tableLayout: 'fixed',
  // NOTE: border radius on the table does not work with `borderCollapse: collapse`,
  // that's why we need `borderCollapse: separate` on the table and to style <th>
  // and <td> separately for borders and border radius.
  '> thead > tr > th, > tbody > tr > td, > tfoot > tr > td': {
    borderRight: border,
    borderBottom: border,
  },
  '> thead > tr > th': {
    borderTop: border,
  },
  '> thead > tr > th:first-of-type, > tbody > tr > td:first-of-type, > tfoot > tr > td:first-of-type':
    {
      borderLeft: border,
    },
  '> thead > tr > th:first-of-type': {
    borderTopLeftRadius: borderRadius,
  },
  '> thead > tr > th:last-of-type': {
    borderTopRightRadius: borderRadius,
  },
  '> tfoot > tr > td:first-of-type': {
    borderBottomLeftRadius: borderRadius,
  },
  '> tfoot > tr > td:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },

  counterReset: tableRowCounter,
});

const alwaysTrue = () => true;

interface EditorTableProps {
  value: TableData;
  onAddColumn?: () => void;
  onAddRow?: () => void;
  onChangeCaption?: (newValue: string) => void;
  onChangeColumnName?: (columnIndex: number, newColumnName: string) => void;
  onChangeColumnType?: (columnIndex: number, newType: TableCellType) => void;
  onChangeCell?: (
    columnIndex: number,
    rowIndex: number,
    newValue: string
  ) => void;
  onRemoveColumn?: (columnIndex: number) => void;
  onRemoveRow?: (rowIndex: number) => void;
  onValidateCell?: (column: TableColumn, value: string) => boolean;
}

export const EditorTable = ({
  value,
  onAddColumn,
  onAddRow,
  onChangeCaption,
  onChangeColumnName = noop,
  onChangeColumnType = noop,
  onChangeCell = noop,
  onRemoveColumn = noop,
  onRemoveRow = noop,
  onValidateCell = alwaysTrue,
}: EditorTableProps): ReturnType<FC> => {
  const tableLength = value.columns[0].cells.length;
  return (
    <div>
      <table css={tableStyles}>
        <EditableTableCaption
          value={value.variableName}
          onChange={onChangeCaption}
        />
        <thead>
          <TableHeaderRow onAddColumn={onAddColumn}>
            {value.columns.map((col, columnIndex) => {
              return (
                <EditableTableHeader
                  onChangeColumnType={(newType) => {
                    onChangeColumnType(columnIndex, newType);
                  }}
                  key={columnIndex}
                  type={col.cellType}
                  value={col.columnName}
                  onChange={(newColumnName) => {
                    onChangeColumnName(columnIndex, newColumnName);
                  }}
                  onRemoveColumn={() => {
                    onRemoveColumn(columnIndex);
                  }}
                />
              );
            })}
          </TableHeaderRow>
        </thead>
        <tbody>
          {Array.from({ length: tableLength }, (_, rowIndex) => {
            return (
              <TableRow
                key={rowIndex}
                onRemove={() => {
                  onRemoveRow(rowIndex);
                }}
              >
                {value.columns.map((column, colIndex) => {
                  return (
                    <EditableTableData
                      key={colIndex}
                      value={column.cells[rowIndex]}
                      onChange={(newValue) => {
                        onChangeCell(colIndex, rowIndex, newValue);
                      }}
                      validate={(newValue) => onValidateCell(column, newValue)}
                    />
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
        <tfoot>
          <AddTableRowButton
            colSpan={value.columns.length + 1}
            onAddRow={onAddRow}
          />
        </tfoot>
      </table>
    </div>
  );
};
