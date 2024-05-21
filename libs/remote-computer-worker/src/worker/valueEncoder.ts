import type { Result, SerializedType } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { N } from '@decipad/number';
import stringify from 'json-stringify-safe';
import type { PromiseOrType } from '@decipad/utils';
import { zip } from '@decipad/utils';
import { encodeString } from './encodeString';
import { encodeNumber } from './encodeNumber';
import { encodeTable } from './encodeTable';
import { encodeTree } from './encodeTree';

const recNoop = (
  _: SerializedType,
  __: DataView,
  ___: Result.OneResult,
  offset: number
) => offset;

export type RecursiveEncoder = (
  type: SerializedType,
  buffer: DataView,
  value: Result.OneResult,
  offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
) => PromiseOrType<number>;

const recursiveEncoders: Record<SerializedType['kind'], RecursiveEncoder> = {
  anything: recNoop,
  nothing: recNoop,
  pending: recNoop,
  'type-error': recNoop,
  boolean: (_, buffer, value, offset) => {
    buffer.setUint8(offset, value ? 1 : 0);
    return offset + 1;
  },
  date: (_, buffer, value, _offset) => {
    let offset = _offset;
    if (value == null) {
      buffer.setUint8(offset, 0);
      offset += 1;
    } else {
      if (typeof value !== 'bigint') {
        throw new TypeError('Expected bigint for date');
      }
      buffer.setUint8(offset, 1);
      offset += 1;
      buffer.setBigInt64(offset, value);
      offset += 8;
    }
    return offset;
  },
  function: (_, buffer, value, _offset) => {
    if (!Value.isFunctionValue(value)) {
      throw new TypeError('Expected function value');
    }
    let offset = _offset;
    // print value.argumentNames
    buffer.setUint8(offset, value.argumentNames.length);
    offset += 1;
    for (const argName of value.argumentNames) {
      offset = encodeString(buffer, offset, argName);
    }
    // print function body
    const bodyAsString = stringify(value.body);
    return encodeString(buffer, offset, bodyAsString);
  },
  number: (_, buffer, value, offset) => encodeNumber(buffer, offset, N(value)),
  range: async (type, buffer, value, _offset) => {
    let offset = _offset;
    if (!Array.isArray(value)) {
      throw new TypeError('Range: Expected array for range');
    }
    if (type.kind !== 'range') {
      throw new TypeError('Range: Expected range type');
    }
    const [from, to] = value;
    const ofType = type.rangeOf;
    const encode = recursiveEncoders[ofType.kind];
    offset = await encode(ofType, buffer, from, offset, recursiveEncoders);
    offset = await encode(ofType, buffer, to, offset, recursiveEncoders);
    return offset;
  },
  row: async (type, buffer, value, _offset) => {
    if (!Array.isArray(value)) {
      throw new TypeError('Row: Expected array for row');
    }
    if (type.kind !== 'row') {
      throw new TypeError('Row: Expected row type');
    }
    let offset = _offset;
    buffer.setUint8(offset, value.length);
    offset += 1;
    for (const [v, subType] of zip(value, type.rowCellTypes)) {
      // eslint-disable-next-line no-await-in-loop
      offset = await recursiveEncoders[subType.kind](
        subType,
        buffer,
        v,
        offset,
        recursiveEncoders
      );
    }
    return offset;
  },
  'materialized-column': async (type, buffer, value, _offset) => {
    if (!Array.isArray(value)) {
      throw new TypeError('Column: Expected array for column');
    }
    if (type.kind !== 'column') {
      throw new TypeError('Column: Expected column type');
    }
    let offset = _offset;
    buffer.setUint8(offset, value.length);
    offset += 1;
    for (const v of value) {
      // eslint-disable-next-line no-await-in-loop
      offset = await recursiveEncoders[type.cellType.kind](
        type.cellType,
        buffer,
        v,
        offset,
        recursiveEncoders
      );
    }
    return offset;
  },
  column: (type, buffer, value, offset) => {
    if (type.kind !== 'column') {
      throw new TypeError('Column: Expected column type');
    }
    if (!Value.isColumnLike(value)) {
      throw new TypeError('Column: Expected column value');
    }
    // eslint-disable-next-line no-use-before-define
    const encoder = recursiveEncoders[type.cellType.kind];
    const cellEncoder: Value.WriteSerializedColumnEncoder = (
      subBuffer,
      subOffset,
      subValue
    ) => {
      return encoder(
        type.cellType,
        subBuffer,
        subValue,
        subOffset,
        recursiveEncoders
      );
    };
    const col = new Value.WriteSerializedColumn(cellEncoder, value);
    return col.serialize(buffer, offset);
  },
  string: (_, buffer, value, offset) => {
    return encodeString(buffer, offset, value?.toString() ?? '');
  },
  table: async (type, buffer, value, _offset) =>
    encodeTable(type, buffer, value, _offset, recursiveEncoders),
  'materialized-table': async (type, buffer, value, _offset) =>
    encodeTable(type, buffer, value, _offset, recursiveEncoders),
  tree: encodeTree,
};

const noop = () => 0;

const encoders: Record<
  SerializedType['kind'],
  (
    type: SerializedType,
    buffer: DataView,
    offset: number,
    value: Result.OneResult
  ) => PromiseOrType<number>
> = {
  anything: noop,
  nothing: noop,
  pending: noop,
  'type-error': noop,
  boolean: (type, buffer, offset, value) =>
    recursiveEncoders.boolean(type, buffer, value, offset, recursiveEncoders),
  date: (type, buffer, offset, value) =>
    recursiveEncoders.date(type, buffer, value, offset, recursiveEncoders),
  function: (type, buffer, offset, value) =>
    recursiveEncoders.function(type, buffer, value, offset, recursiveEncoders),
  number: (type, buffer, offset, value) =>
    recursiveEncoders.number(type, buffer, value, offset, recursiveEncoders),
  string: (type, buffer, offset, value) =>
    recursiveEncoders.string(type, buffer, value, offset, recursiveEncoders),
  range: (type, buffer, offset, value) =>
    recursiveEncoders.range(type, buffer, value, offset, recursiveEncoders),
  row: (type, buffer, offset, value) =>
    recursiveEncoders.row(type, buffer, value, offset, recursiveEncoders),
  column: (type, buffer, offset, value) =>
    recursiveEncoders.row(type, buffer, value, offset, recursiveEncoders),
  'materialized-column': (type, buffer, offset, value) =>
    recursiveEncoders.row(type, buffer, value, offset, recursiveEncoders),
  table: (type, buffer, offset, value) =>
    recursiveEncoders.table(type, buffer, value, offset, recursiveEncoders),
  'materialized-table': (type, buffer, offset, value) =>
    recursiveEncoders['materialized-table'](
      type,
      buffer,
      value,
      offset,
      recursiveEncoders
    ),
  tree: (type, buffer, offset, value) =>
    recursiveEncoders.tree(type, buffer, value, offset, recursiveEncoders),
};

export const valueEncoder = (type: SerializedType) => {
  const encoder = encoders[type.kind];
  return (buffer: DataView, offset: number, value: Result.OneResult) =>
    encoder(type, buffer, offset, value);
};
