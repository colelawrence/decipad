import { N } from '@decipad/number';
import { from, map } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import { Result, SerializedTypes, Value } from '@decipad/language-types';
import { getInstanceof } from '@decipad/utils';
import { buildResult } from '../utils/buildResult';

// eslint-disable-next-line complexity
export const resultToValue = async (
  result: Result.Result
): Promise<Value.Value> => {
  const { type, value } = result;

  if (typeof value === 'symbol') {
    return Value.UnknownValue;
  }

  switch (type.kind) {
    case 'type-error':
    case 'pending':
    case 'nothing':
    case 'function':
    case 'anything':
      return Value.UnknownValue;

    case 'materialized-table': {
      const tableValue = value as Result.ResultMaterializedTable;
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
      return Value.Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'table': {
      const tableValue = value as Result.ResultTable;
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
      return Value.Table.fromNamedColumns(columns, tableType.columnNames);
    }

    case 'column':
    case 'materialized-column': {
      const columnValue = value as
        | Result.ResultColumn
        | Result.ResultMaterializedColumn;
      if (columnValue == null) {
        const defaultV = Value.defaultValue(type);
        return Value.Column.fromValues([Value.fromJS(0, defaultV)], defaultV);
      }
      const columnType = type as SerializedTypes.Column;
      let columnGen: Value.ValueGeneratorFunction;
      if (typeof columnValue === 'function') {
        columnGen = (start?: number, end?: number) =>
          map(columnValue(start, end), async (cell: Result.OneResult) =>
            resultToValue(buildResult(columnType.cellType, cell, false))
          );
      } else if (Array.isArray(columnValue)) {
        columnGen = () =>
          map(from(columnValue.slice()), async (cell: Result.OneResult) =>
            resultToValue({
              type: columnType.cellType,
              value: cell,
            } as Result.Result)
          );
      } else {
        throw new Error(`panic: got invalid column: ${typeof value}`);
      }
      return Value.Column.fromGenerator(columnGen);
    }

    case 'number': {
      return Value.Scalar.fromValue(N(value as Result.ResultNumber));
    }

    case 'date': {
      let dateValue = value as Result.ResultDate;
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
      return Value.Scalar.fromValue(value as Result.ResultBoolean);

    case 'string':
      return Value.Scalar.fromValue((value as Result.ResultString).toString());

    case 'range':
      const rangeValue = value as Result.ResultRange;
      const [start, end] = rangeValue.map(Value.Scalar.fromValue);
      return Value.Range.fromBounds(start, end);

    case 'row':
      const rowValue = value as Result.ResultRow;
      const rowType = type as SerializedTypes.Row;
      return Value.Row.fromNamedCells(
        await Promise.all(
          rowValue.map(async (cell, index) =>
            resultToValue(buildResult(rowType.rowCellTypes[index], cell, false))
          )
        ),
        rowType.rowCellNames
      );

    case 'tree':
      return getInstanceof(value, Value.Tree);
  }
};
