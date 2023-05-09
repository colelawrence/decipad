import { N } from '@decipad/number';
import { from, map } from '@decipad/generator-utils';
import { Result, Value, Table, Column, SerializedTypes } from '..';
import { DateValue, fromJS, Range, Row, Scalar, UnknownValue } from '../value';
import {
  ResultBoolean,
  ResultColumn,
  ResultDate,
  ResultNumber,
  ResultRange,
  ResultRow,
  ResultString,
  ResultTable,
  ResultMaterializedColumn,
  ResultMaterializedTable,
} from '../interpreter/interpreter-types';
import { ValueGeneratorFunction } from '../value/types';

export const resultToValue = async (result: Result.Result): Promise<Value> => {
  const { type, value } = result;
  switch (type.kind) {
    case 'type-error':
    case 'pending':
    case 'nothing':
    case 'function':
    case 'anything':
      return Result.UnknownValue;

    case 'materialized-table': {
      const tableValue = value as ResultMaterializedTable;
      const tableType = type as SerializedTypes.MaterializedTable;
      const columns = await Promise.all(
        tableType.columnTypes.map(async (columnType, index) => {
          return resultToValue({
            type: {
              kind: 'materialized-column',
              indexedBy: tableType.columnNames[0],
              cellType: columnType,
            },
            value: tableValue[index],
          });
        })
      );
      return Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'table': {
      const tableValue = value as ResultTable;
      const tableType = type as SerializedTypes.Table;
      const columns = await Promise.all(
        tableType.columnTypes.map(async (columnType, index) => {
          return resultToValue({
            type: {
              kind: 'column',
              indexedBy: tableType.columnNames[0],
              cellType: columnType,
            },
            value: tableValue[index],
          });
        })
      );
      return Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'column':
    case 'materialized-column': {
      const columnValue = value as ResultColumn | ResultMaterializedColumn;
      if (columnValue == null) {
        return Column.fromValues([fromJS(0)]);
      }
      const columnType = type as SerializedTypes.Column;
      let columnGen: ValueGeneratorFunction;
      if (typeof columnValue === 'function') {
        columnGen = (start?: number, end?: number) =>
          map(columnValue(start, end), async (cell: Result.OneResult) =>
            resultToValue({ type: columnType.cellType, value: cell })
          );
      } else if (Array.isArray(columnValue)) {
        columnGen = () =>
          map(from(columnValue.slice()), async (cell: Result.OneResult) =>
            resultToValue({ type: columnType.cellType, value: cell })
          );
      } else {
        throw new Error(`panic: got invalid column: ${typeof value}`);
      }
      return Column.fromGenerator(columnGen);
    }

    case 'number': {
      return Scalar.fromValue(N(value as ResultNumber));
    }

    case 'date': {
      let dateValue = value as ResultDate;
      if (dateValue == null || typeof dateValue === 'symbol') {
        return UnknownValue;
      }
      if (typeof dateValue !== 'bigint') {
        dateValue = BigInt(dateValue);
      }
      return DateValue.fromDateAndSpecificity(
        dateValue,
        (result.type as SerializedTypes.Date).date
      );
    }

    case 'boolean':
      return Scalar.fromValue(value as ResultBoolean);

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
        await Promise.all(
          rowValue.map(async (cell, index) =>
            resultToValue({ type: rowType.rowCellTypes[index], value: cell })
          )
        ),
        rowType.rowCellNames
      );
  }
};
