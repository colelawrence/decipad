import { TableData } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { FC } from 'react';
import { useReadOnly } from 'slate-react';
import { useComputer } from '@decipad/react-contexts';
import { parseCell } from '@decipad/editor-utils';
import { formatCell } from '../utils/formatCell';
import {
  addColumn,
  addRow,
  changeCell,
  changeColumnName,
  changeColumnType,
  changeVariableName,
  removeColumn,
  removeRow,
} from './actions';

interface TableInnerProps {
  value: TableData;
  onChange: (newData: TableData) => void;
}

/** Table without slate bindings */
export const TableInner = ({
  value,
  onChange,
}: TableInnerProps): ReturnType<FC> => {
  const computer = useComputer();
  const readOnly = useReadOnly();
  return (
    <organisms.EditorTable
      formatValue={(column, text) => formatCell(column.cellType, text)}
      onAddColumn={() => {
        onChange(addColumn(value));
      }}
      onAddRow={() => {
        onChange(addRow(value));
      }}
      onChangeCaption={(newVariableName) => {
        onChange(changeVariableName(value, newVariableName));
      }}
      onChangeCell={(colIndex, rowIndex, newText) => {
        onChange(changeCell(value, { colIndex, rowIndex, newText }));
      }}
      onChangeColumnType={(columnIndex, newType) => {
        onChange(changeColumnType(value, columnIndex, newType));
      }}
      onChangeColumnName={(columnIndex, newColumnName) => {
        onChange(changeColumnName(value, columnIndex, newColumnName));
      }}
      onRemoveColumn={(columnIndex) => {
        onChange(removeColumn(value, columnIndex));
      }}
      onRemoveRow={(rowIndex) => {
        onChange(removeRow(value, rowIndex));
      }}
      onValidateCell={(column, text) =>
        parseCell(column.cellType, text) != null
      }
      parseUnit={computer.getUnitFromText.bind(computer)}
      readOnly={readOnly}
      value={value}
    />
  );
};
