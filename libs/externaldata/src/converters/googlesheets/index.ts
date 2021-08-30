import {
  Table,
  Type,
  Vector,
  FloatVector,
  BoolVector,
  Utf8Vector,
  DateDayVector,
  DateMillisecondVector,
} from '@apache-arrow/es5-cjs';
import { columnNameFromIndex } from './column-name';
import { parseDate, dateGranularityFromString } from '../date';

type Value = string | boolean | number;

type Column = Value[];

export interface Sheet {
  values: Column[];
}

export function toTable(data: Sheet): Table {
  const columnNames: string[] = [];
  const types: Type[] = [];
  const columns = data.values;
  for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
    const column = columns[colIndex];
    columnNames.push(columnNameFromIndex(colIndex));
    types.push(columnType(column));
  }

  const vectors = types.map((type, index) =>
    columnToArrowVector(type, columns[index])
  );
  return Table.new(vectors, columnNames);
}

function columnToArrowVector(type: Type, data: Value[]): Vector {
  switch (type) {
    case Type.Bool:
      return BoolVector.from(data);
    case Type.Float:
    case Type.Float16:
    case Type.Float32:
    case Type.Float64:
      return FloatVector.from(new Float64Array(data as number[]));
    case Type.DateDay:
      return DateDayVector.from((data as string[]).map(parseDate));
    case Type.DateMillisecond:
      return DateMillisecondVector.from((data as string[]).map(parseDate));
    case Type.Utf8:
      return Utf8Vector.from(data);
    default:
      throw new Error(
        `don't know how to translate arrow type ${type} into a vector`
      );
  }
}

function columnType(column: Column): Type {
  let type: Type | undefined;
  for (const value of column) {
    const t = typeof value;
    let foundType: Type | undefined;
    if (t === 'boolean') {
      foundType = Type.Bool;
    } else if (t === 'string') {
      foundType = stringTypeFromValue(value as string);
    } else if (t === 'number') {
      foundType = Type.Float64;
    }
    if (foundType !== undefined) {
      type = shouldOverrideWith(type, foundType);
    }
  }

  return type === undefined ? Type.Utf8 : type;
}

function shouldOverrideWith(oldType: Type | undefined, newType: Type): Type {
  if (oldType === undefined || newType === Type.Utf8) {
    // string is weaker, so it always overrides
    return newType;
  }
  if (oldType === Type.DateMillisecond && newType === Type.DateDay) {
    return oldType;
  }
  if (oldType !== newType) {
    // default to string when columns have mixed types
    return Type.Utf8;
  }
  return newType;
}

function stringTypeFromValue(value: string): Type {
  const date = parseDate(value);
  if (!date) {
    return Type.Utf8;
  }
  const granularity = dateGranularityFromString(value);
  switch (granularity) {
    // TODO: Apparently arrow only has these 2 types of date granularity:
    case 'year':
    case 'month':
    case 'day':
      return Type.DateDay;
    default:
      return Type.DateMillisecond;
  }
}
