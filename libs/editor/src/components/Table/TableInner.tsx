import { FC } from 'react';

import { organisms } from '@decipad/ui';

import { useReadOnly } from 'slate-react';
import {
  changeVariableName,
  addColumn,
  addRow,
  changeCell,
  changeColumnName,
  changeColumnType,
  removeColumn,
  removeRow,
} from './actions';
import { TableData } from '../../utils/tableTypes';
import { parseCell } from '../../utils/parseCell';
import { useComputer } from '../../contexts/Computer';
import { formatCell } from '../../utils/formatCell';

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
