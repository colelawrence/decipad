import {
  Unknown,
  type Result,
  type SerializedType,
} from '@decipad/language-interfaces';
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
import type { RecursiveEncoder } from './types';
import { recursiveEncodeColumn } from './recursiveEncodeColumn';
import { encodeTrend } from './encodeTrend';

const recNoop = (_: Result.Result, __: DataView, offset: number) => offset;

export const recursiveEncoders: Record<
  SerializedType['kind'],
  RecursiveEncoder
> = {
  anything: recNoop,
  nothing: recNoop,
  pending: recNoop,
  'type-error': recNoop,
  boolean: ({ value }, buffer, offset) => {
    buffer.setUint8(offset, value ? 1 : 0);
    return offset + 1;
  },
  date: ({ value }, buffer, _offset) => {
    let offset = _offset;
    if (value == null || value === Unknown) {
      buffer.setUint8(offset, 0);
      offset += 1;
    } else {
      if (typeof value !== 'bigint') {
        // eslint-disable-next-line no-console
        console.warn(value);
        throw new TypeError(`Expected bigint for date and got ${typeof value}`);
      }
      buffer.setUint8(offset, 1);
      offset += 1;
      buffer.setBigInt64(offset, value);
      offset += 8;
    }
    return offset;
  },
  function: ({ value }, buffer, _offset) => {
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
  number: ({ value }, buffer, offset) => encodeNumber(buffer, offset, N(value)),
  range: async ({ type, value }, buffer, _offset) => {
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
    offset = await encode(
      { type: ofType, value: from, meta: undefined },
      buffer,
      offset,
      recursiveEncoders
    );
    offset = await encode(
      { type: ofType, value: to, meta: undefined },
      buffer,
      offset,
      recursiveEncoders
    );
    return offset;
  },
  row: async ({ type, value }, buffer, _offset) => {
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
        { type: subType, value: v, meta: undefined },
        buffer,
        offset,
        recursiveEncoders
      );
    }
    return offset;
  },
  'materialized-column': recursiveEncodeColumn,
  column: recursiveEncodeColumn,
  string: ({ value }, buffer, offset) => {
    return encodeString(buffer, offset, value?.toString() ?? '');
  },
  table: async (result, buffer, _offset) =>
    encodeTable(result, buffer, _offset, recursiveEncoders),
  'materialized-table': async (result, buffer, _offset) =>
    encodeTable(result, buffer, _offset, recursiveEncoders),
  tree: encodeTree,
  trend: encodeTrend,
};

const noop = () => 0;

const encoders: Record<
  SerializedType['kind'],
  (
    result: Result.Result,
    buffer: DataView,
    offset: number
  ) => PromiseOrType<number>
> = {
  anything: noop,
  nothing: noop,
  pending: noop,
  'type-error': noop,
  boolean: (result, buffer, offset) =>
    recursiveEncoders.boolean(result, buffer, offset, recursiveEncoders),
  date: (result, buffer, offset) =>
    recursiveEncoders.date(result, buffer, offset, recursiveEncoders),
  function: (result, buffer, offset) =>
    recursiveEncoders.function(result, buffer, offset, recursiveEncoders),
  number: (result, buffer, offset) =>
    recursiveEncoders.number(result, buffer, offset, recursiveEncoders),
  string: (result, buffer, offset) =>
    recursiveEncoders.string(result, buffer, offset, recursiveEncoders),
  range: (result, buffer, offset) =>
    recursiveEncoders.range(result, buffer, offset, recursiveEncoders),
  row: (result, buffer, offset) =>
    recursiveEncoders.row(result, buffer, offset, recursiveEncoders),
  column: (result, buffer, offset) =>
    recursiveEncoders.column(result, buffer, offset, recursiveEncoders),
  'materialized-column': (result, buffer, offset) =>
    recursiveEncoders.column(result, buffer, offset, recursiveEncoders),
  table: (result, buffer, offset) =>
    recursiveEncoders.table(result, buffer, offset, recursiveEncoders),
  'materialized-table': (result, buffer, offset) =>
    recursiveEncoders['materialized-table'](
      result,
      buffer,
      offset,
      recursiveEncoders
    ),
  tree: (result, buffer, offset) =>
    recursiveEncoders.tree(result, buffer, offset, recursiveEncoders),
  trend: (result, buffer, offset) =>
    recursiveEncoders.trend(result, buffer, offset, recursiveEncoders),
};

export const valueEncoder = (type: SerializedType) => {
  const encoder = encoders[type.kind];
  return (
    buffer: DataView,
    offset: number,
    value: Result.OneResult,
    meta: undefined | (() => Result.ResultMetadata)
  ) => encoder({ type, value, meta }, buffer, offset);
};
