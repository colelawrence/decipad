import {
  Interpreter,
  Result,
  SerializedType,
  SerializedTypes,
} from '@decipad/computer';
import { toFraction } from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { tableFromIPC, Table, Type as ArrowType } from 'apache-arrow';
import { errorResult } from './utils/errorResult';

interface ToStringable {
  toString: () => string;
}

export function toInternalType(_type: ArrowType): SerializedType {
  let type: string | ArrowType = _type;
  if (
    typeof _type === 'object' &&
    typeof (_type as ToStringable).toString === 'function'
  ) {
    type = (_type as ToStringable).toString();
  }
  switch (type) {
    case 'Bool':
    case ArrowType.Bool:
      return {
        kind: 'boolean',
      };
    case 'Date':
    case 'DateMillisecond':
    case 'Date64<MILLISECOND>':
    case ArrowType.DateMillisecond:
      // TODO: get granularity from date
      return {
        kind: 'date',
        date: 'millisecond',
      };
    case 'Float':
    case 'Float16':
    case 'Float32':
    case 'Float64':
    case ArrowType.Float:
    case ArrowType.Float16:
    case ArrowType.Float32:
    case ArrowType.Float64:
      return { kind: 'number', unit: null };
    case 'Dictionary<Int32, Utf8>':
    case 'Utf8':
    case ArrowType.Utf8:
      return { kind: 'string' };
    default:
      return {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: `Don't know how to convert from arrow type ${type} to internal type`,
        },
      };
  }
}

const inferData = (data: Table): SerializedType => {
  const columnTypes: SerializedType[] = [];
  const columnNames: string[] = [];

  for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
    const columnMeta = data.schema.fields[colIndex];
    try {
      const column = getDefined(data.getChildAt(colIndex));
      const columnType: SerializedType = toInternalType(column.type);
      columnTypes.push(columnType);
      columnNames.push(columnMeta.name);
    } catch (err) {
      return {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: `Error inferring type of column ${columnMeta.name}: ${
            (err as Error).message
          }`,
        },
      };
    }
  }

  return {
    kind: 'table',
    indexName: columnNames[0],
    columnTypes,
    columnNames,
  };
};

const evaluateCell = (cell: unknown): Result.OneResult => {
  const tof = typeof cell;
  if (cell == null) {
    return Result.UnknownValue.getData();
  }
  if (tof === 'number') {
    return toFraction(cell as number);
  }
  if (tof === 'boolean' || tof === 'string') {
    return cell as string | boolean;
  }
  if (typeof cell === 'object') {
    if (cell instanceof Date) {
      return BigInt(cell.getTime());
    }
    if ('toString' in cell && typeof cell.toString === 'function') {
      return cell.toString();
    }
  }
  return Result.UnknownValue.getData();
};

const evaluateData = (
  _type: SerializedTypes.Table,
  data: Table
): Result.Result<'table'>['value'] => {
  const colValues: Interpreter.ResultColumn[] = [];

  for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
    const column = getDefined(
      data.getChildAt(colIndex),
      `expected column at ${colIndex}`
    );
    const values: Interpreter.ResultColumn = [];
    for (let rowIndex = 0; rowIndex < column.length; rowIndex += 1) {
      values.push(evaluateCell(column.get(rowIndex)));
    }
    colValues.push(values);
  }

  return colValues;
};

export const importFromArrow = async (
  resp: Response
): Promise<Result.Result> => {
  const arrowTable = await tableFromIPC(resp);
  const type = inferData(arrowTable);
  if (type.kind === 'table') {
    return {
      type,
      value: evaluateData(type, arrowTable),
    };
  }
  if (type.kind === 'type-error') {
    return {
      type,
      value: Result.UnknownValue.getData(),
    };
  }
  return errorResult(`Unexpected result of type ${type.kind}`);
};
