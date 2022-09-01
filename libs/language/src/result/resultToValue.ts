import Fraction from '@decipad/fraction';
import { Result, Value, Table, Column, SerializedTypes } from '..';
import { Range, Row, Scalar } from '../interpreter';
import {
  ResultBoolean,
  ResultColumn,
  ResultDate,
  ResultNumber,
  ResultRange,
  ResultRow,
  ResultString,
  ResultTable,
} from '../interpreter/interpreter-types';

export const resultToValue = (result: Result.Result): Value => {
  const { type, value } = result;
  switch (type.kind) {
    case 'type-error':
    case 'nothing':
    case 'function':
    case 'anything':
      return Result.UnknownValue;

    case 'table': {
      const tableValue = value as ResultTable;
      const tableType = type as SerializedTypes.Table;
      const columns = tableType.columnTypes.map((columnType, index) => {
        return resultToValue({
          type: {
            kind: 'column',
            indexedBy: tableType.columnNames[0],
            cellType: columnType,
            columnSize: tableType.tableLength,
          },
          value: tableValue[index],
        });
      });
      return Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'column': {
      const columnValue = value as ResultColumn;
      const columnType = type as SerializedTypes.Column;
      return Column.fromValues(
        columnValue.map((cell) =>
          resultToValue({ type: columnType.cellType, value: cell })
        )
      );
    }

    case 'number': {
      let numberValue = value as ResultNumber;
      if (!(numberValue instanceof Fraction)) {
        numberValue = new Fraction(numberValue);
      }
      return Scalar.fromValue(numberValue);
    }

    case 'date': {
      let dateValue = value as ResultDate;
      if (typeof dateValue !== 'bigint') {
        dateValue = BigInt(dateValue);
      }
      return Scalar.fromValue(dateValue);
    }

    case 'boolean':
      return Scalar.fromValue(value as ResultBoolean | ResultDate);

    case 'string':
      return Scalar.fromValue((value as ResultString).toString());

    case 'range':
      const rangeValue = value as ResultRange;
      const [start, end] = rangeValue.map(Scalar.fromValue);
      return Range.fromBounds(start, end);

    case 'row':
      const rowValue = value as ResultRow;
      const rowType = type as SerializedTypes.Row;
      return Row.fromNamedCells(
        rowValue.map((cell, index) =>
          resultToValue({ type: rowType.rowCellTypes[index], value: cell })
        ),
        rowType.rowCellNames
      );
  }
};
