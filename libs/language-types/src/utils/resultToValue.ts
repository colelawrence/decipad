import { N } from '@decipad/number';
import { from, slice } from '@decipad/generator-utils';
import { getInstanceof } from '@decipad/utils';
import type {
  MaterializedTable,
  Result,
  SerializedTypes,
  Value,
} from '@decipad/language-interfaces';
import { UnknownValue } from '../Value/Unknown';
import { buildResult } from './buildResult';
import { Table } from '../Value/Table';
import { defaultValue } from '../Value/defaultValue';
import { Column } from '../Value/Column';
import { fromJS } from '../Value/fromJS';
import { LeanColumn } from '../Value/LeanColumn';
import { DateValue } from '../Value/Date';
import { Scalar } from '../Value/Scalar';
import { Range } from '../Value/Range';
import { Row } from '../Value/Row';
import { Tree } from '../Value/Tree';
import { Trend } from '../Value';

// eslint-disable-next-line complexity
export const resultToValue = (result: Result.Result): Value.Value => {
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
      const tableValue = value as Result.ResultMaterializedTable;
      const tableType = type as MaterializedTable;
      const columns = tableType.columnTypes.map((columnType, index) => {
        const columnValue = tableValue[index];
        return resultToValue({
          type: {
            kind: 'materialized-column',
            indexedBy: tableType.columnNames[0],
            cellType: columnType,
            atParentIndex: index,
          },
          value: columnValue,
          meta: result.meta,
        });
      });
      return Table.fromNamedColumns(
        columns,
        tableType.columnNames,
        result.meta
      );
    }

    case 'table': {
      const tableValue = value as Result.ResultTable;
      const tableType = type as SerializedTypes.Table;
      const columns = tableType.columnTypes.map((columnType, index) => {
        const columnValue = tableValue[index];
        return resultToValue({
          type: {
            kind: 'column',
            indexedBy: tableType.columnNames[0],
            cellType: columnType,
            atParentIndex: index,
          },
          value: columnValue,
          meta: result.meta,
        });
      });
      return Table.fromNamedColumns(
        columns,
        tableType.columnNames,
        result.meta
      );
    }

    case 'column':
    case 'materialized-column': {
      const columnValue = value as
        | Result.ResultColumn
        | Result.ResultMaterializedColumn;

      if (columnValue == null) {
        const defaultV = defaultValue(type);
        return Column.fromValues(
          [fromJS(0, defaultV)],
          () => result.meta as Result.ResultMetadataColumn,
          defaultV
        );
      }

      const columnType = type as SerializedTypes.Column;
      let columnGen: Result.ResultGenerator;

      if (typeof columnValue === 'function') {
        columnGen = columnValue;
      } else if (Array.isArray(columnValue)) {
        columnGen = (start = 0, end = Infinity) =>
          slice(from(columnValue.slice()), start, end);
      } else {
        console.error('got invalid column:', value);
        throw new Error(`panic: got invalid column: ${typeof value}`);
      }

      return LeanColumn.fromGeneratorAndType(
        columnGen,
        columnType.cellType,
        () => result.meta as Result.ResultMetadataColumn,
        `resultToValue<column<${columnType.cellType}>>`
      );
    }

    case 'number': {
      return Scalar.fromValue(N(value as Result.ResultNumber));
    }

    case 'date': {
      let dateValue = value as Result.ResultDate;
      if (dateValue == null || typeof dateValue === 'symbol') {
        return UnknownValue;
      }
      if (typeof dateValue !== 'bigint') {
        try {
          dateValue = BigInt(dateValue);
        } catch (err) {
          console.error(`Error converting "${dateValue}" to BigInt`);
          throw err;
        }
      }
      return DateValue.fromDateAndSpecificity(
        dateValue,
        (result.type as SerializedTypes.Date).date
      );
    }

    case 'boolean':
      return Scalar.fromValue(value as Result.ResultBoolean);

    case 'string':
      return Scalar.fromValue((value as Result.ResultString).toString());

    case 'range':
      const rangeValue = value as Result.ResultRange;
      const [start, end] = rangeValue.map(Scalar.fromValue);
      return Range.fromBounds(start, end);

    case 'row':
      const rowValue = value as Result.ResultRow;
      const rowType = type as SerializedTypes.Row;
      return Row.fromNamedCells(
        rowValue.map((cell, index) =>
          resultToValue(buildResult(rowType.rowCellTypes[index], cell))
        ),
        rowType.rowCellNames
      );

    case 'tree':
      return getInstanceof(value, Tree);

    case 'trend':
      return getInstanceof(value, Trend);
  }
};
