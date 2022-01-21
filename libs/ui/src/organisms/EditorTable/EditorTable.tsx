import { FC } from 'react';
import {
  AddTableRowButton,
  EditableTableCaption,
  EditableTableData,
  TableHeaderRow,
  TableRow,
} from '../../molecules';
import { EditableTableHeader, Table } from '..';
import { TableCellType, TableColumn, TableData } from './types';
import { noop } from '../../utils';

const alwaysTrue = () => true;

interface EditorTableProps {
  readOnly?: boolean;
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
  readOnly = false,
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
      <Table>
        <EditableTableCaption
          value={value.variableName}
          onChange={onChangeCaption}
          readOnly={readOnly}
        />
        <thead>
          <TableHeaderRow onAddColumn={onAddColumn} readOnly={readOnly}>
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
                  readOnly={readOnly}
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
                readOnly={readOnly}
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
                      readOnly={readOnly}
                    />
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
        {!readOnly && (
          <tfoot>
            <AddTableRowButton
              colSpan={value.columns.length + 1}
              onAddRow={onAddRow}
            />
          </tfoot>
        )}
      </Table>
    </div>
  );
};
