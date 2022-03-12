import { FC } from 'react';
import { SerializedUnits } from '@decipad/language';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  AddTableRowButton,
  EditableTableCaption,
  EditableTableData,
  TableHeaderRow,
  TableRow,
} from '../../molecules';
import { EditableTableHeader, Table } from '..';
import { TableCellType, TableColumn, TableData } from '../../types';

const alwaysTrue = () => true;

const etStyle = css({
  marginBottom: '8px',
  paddingBottom: '6px',
});

interface EditorTableProps {
  readOnly?: boolean;
  value: TableData;
  readonly formatValue?: (column: TableColumn, text: string) => string;
  readonly onAddColumn?: () => void;
  readonly onAddRow?: () => void;
  readonly onChangeCaption?: (newValue: string) => void;
  readonly onChangeColumnName?: (
    columnIndex: number,
    newColumnName: string
  ) => void;
  readonly onChangeColumnType?: (
    columnIndex: number,
    newType: TableCellType
  ) => void;
  readonly onChangeCell?: (
    columnIndex: number,
    rowIndex: number,
    newValue: string
  ) => void;
  readonly onRemoveColumn?: (columnIndex: number) => void;
  readonly onRemoveRow?: (rowIndex: number) => void;
  readonly onValidateCell?: (column: TableColumn, value: string) => boolean;
  readonly parseUnit?: (value: string) => Promise<SerializedUnits | null>;
}

export const EditorTable = ({
  readOnly = false,
  value,
  formatValue = (_, text) => text,
  onAddColumn,
  onAddRow,
  onChangeCaption,
  onChangeColumnName = noop,
  onChangeColumnType = noop,
  onChangeCell = noop,
  onRemoveColumn = noop,
  onRemoveRow = noop,
  onValidateCell = alwaysTrue,
  parseUnit,
}: EditorTableProps): ReturnType<FC> => {
  const tableLength = value.columns[0].cells.length;
  return (
    <div css={etStyle}>
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
                  parseUnit={parseUnit}
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
              >
                {value.columns.map((column, colIndex) => {
                  return (
                    <EditableTableData
                      key={colIndex}
                      format={(text) => formatValue(column, text)}
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
      </Table>
    </div>
  );
};
