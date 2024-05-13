import { N } from '@decipad/number';
import { from, slice } from '@decipad/generator-utils';
import { getInstanceof } from '@decipad/utils';
import type {
  Result,
  ResultBoolean,
  ResultColumn,
  ResultDate,
  ResultGenerator,
  ResultMaterializedColumn,
  ResultMaterializedTable,
  ResultNumber,
  ResultRange,
  ResultRow,
  ResultString,
  ResultTable,
} from '../Result';
import { UnknownValue } from '../Value/Unknown';
import type { MaterializedTable } from '../SerializedTypes';
import type { SerializedTypes } from '../SerializedType';
import { Value } from '..';
import { buildResult } from './buildResult';

// eslint-disable-next-line complexity
export const resultToValue = (result: Result): Value.Value => {
  const { type, value } = result;

  if (typeof value === 'symbol') {
    return UnknownValue;
  }

  switch (type.kind) {
    case 'type-error':
    case 'pending':
    case 'nothing':
    case 'function':
    case 'anything':
      return UnknownValue;

    case 'materialized-table': {
      const tableValue = value as ResultMaterializedTable;
      const tableType = type as MaterializedTable;
      const columns = tableType.columnTypes.map((columnType, index) => {
        return resultToValue({
          type: {
            kind: 'materialized-column',
            indexedBy: tableType.columnNames[0],
            cellType: columnType,
          },
          value: tableValue[index],
        });
      });
      return Value.Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'table': {
      const tableValue = value as ResultTable;
      const tableType = type as SerializedTypes.Table;
      const columns = tableType.columnTypes.map((columnType, index) => {
        return resultToValue({
          type: {
            kind: 'column',
            indexedBy: tableType.columnNames[0],
            cellType: columnType,
          },
          value: tableValue[index],
        });
      });
      return Value.Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'column':
    case 'materialized-column': {
      const columnValue = value as ResultColumn | ResultMaterializedColumn;
      if (columnValue == null) {
        const defaultV = Value.defaultValue(type);
        return Value.Column.fromValues([Value.fromJS(0, defaultV)], defaultV);
      }
      const columnType = type as SerializedTypes.Column;
      let columnGen: ResultGenerator;
      if (typeof columnValue === 'function') {
        columnGen = (start = 0, end = Infinity) => columnValue(start, end);
      } else if (Array.isArray(columnValue)) {
        columnGen = (start = 0, end = Infinity) =>
          slice(from(columnValue.slice()), start, end);
      } else {
        console.error('got invalid column:', value);
        throw new Error(`panic: got invalid column: ${typeof value}`);
      }
      return Value.LeanColumn.fromGeneratorAndType(
        columnGen,
        columnType.cellType,
        `resultToValue<column<${columnType.cellType}>>`
      );
    }

    case 'number': {
      return Value.Scalar.fromValue(N(value as ResultNumber));
    }

    case 'date': {
      let dateValue = value as ResultDate;
      if (dateValue == null || typeof dateValue === 'symbol') {
        return Value.UnknownValue;
      }
      if (typeof dateValue !== 'bigint') {
        try {
          dateValue = BigInt(dateValue);
        } catch (err) {
          console.error(`Error converting "${dateValue}" to BigInt`);
          throw err;
        }
      }
      return Value.DateValue.fromDateAndSpecificity(
        dateValue,
        (result.type as SerializedTypes.Date).date
      );
    }

    case 'boolean':
      return Value.Scalar.fromValue(value as ResultBoolean);

    case 'string':
      return Value.Scalar.fromValue((value as ResultString).toString());

    case 'range':
      const rangeValue = value as ResultRange;
      const [start, end] = rangeValue.map(Value.Scalar.fromValue);
      return Value.Range.fromBounds(start, end);

    case 'row':
      const rowValue = value as ResultRow;
      const rowType = type as SerializedTypes.Row;
      return Value.Row.fromNamedCells(
        rowValue.map((cell, index) =>
          resultToValue(buildResult(rowType.rowCellTypes[index], cell))
        ),
        rowType.rowCellNames
      );

    case 'tree':
      return getInstanceof(value, Value.Tree);
  }
};
