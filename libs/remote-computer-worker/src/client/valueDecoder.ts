import {
  Unknown,
  type Result,
  type SerializedType,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { decodeString } from './decodeString';
import { decodeNumber } from './decodeNumber';
import type { PromiseOrType } from '@decipad/utils';
import { decodeTree } from './decodeTree';

export type RecursiveDecoder = (
  type: SerializedType,
  buffer: DataView,
  offset: number,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
) => PromiseOrType<[Result.OneResult, number]>;

export type ValueDecoder = (
  buffer: DataView,
  offset: number
) => PromiseOrType<[Result.OneResult, number]>;

const decodeNothing: RecursiveDecoder = (_, __, offset) => [Unknown, offset];

const refuse: RecursiveDecoder = (type) => {
  throw new Error(`Should not try to decode value of type ${type.kind}`);
};

export const decoders: Record<SerializedType['kind'], RecursiveDecoder> = {
  anything: decodeNothing,
  nothing: decodeNothing,
  pending: decodeNothing,
  'type-error': decodeNothing,
  boolean: (_, buffer, offset) => [buffer.getUint8(offset) > 0, offset + 1],
  date: (_, buffer, _offset) => {
    let offset = _offset;
    const isDefined = buffer.getUint8(offset);
    offset += 1;
    if (isDefined === 0) {
      return [Unknown, offset];
    }
    const dateValue = buffer.getBigInt64(offset);
    offset += 8;

    return [dateValue, offset];
  },
  function: (_, buffer, _offset) => {
    let offset = _offset;
    // print value.argumentNames
    const argCount = buffer.getUint8(offset);
    offset += 1;
    const argumentNames: string[] = [];
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      let argName: string;
      [argName, offset] = decodeString(buffer, offset);
      argumentNames.push(argName);
    }
    // print function body
    let body: string;
    // eslint-disable-next-line prefer-const
    [body, offset] = decodeString(buffer, offset);
    return [Value.FunctionValue.from(argumentNames, JSON.parse(body)), offset];
  },
  string: (_, buffer, offset) => decodeString(buffer, offset),
  number: (_, buffer, offset) => decodeNumber(buffer, offset),
  range: async (type, buffer, _offset) => {
    if (type.kind !== 'range') {
      throw new TypeError('Range: Expected range type');
    }
    let offset = _offset;

    const ofType = type.rangeOf;
    const decode = decoders[ofType.kind];

    // eslint-disable-next-line prefer-const
    let from: Result.OneResult;
    // eslint-disable-next-line prefer-const
    [from, offset] = await decode(type, buffer, offset, decoders);

    let to: Result.OneResult;
    // eslint-disable-next-line prefer-const
    [to, offset] = await decode(type, buffer, offset, decoders);
    return [[from, to], offset];
  },
  row: async (type, buffer, _offset) => {
    if (type.kind !== 'row') {
      throw new TypeError('Row: Expected row type');
    }

    let offset = _offset;

    const cellCount = buffer.getUint8(offset);
    offset += 1;
    if (cellCount !== type.rowCellTypes.length) {
      throw new TypeError('Row: Expected cell count to match type');
    }
    const row: Array<Result.OneResult> = [];
    for (const subType of type.rowCellTypes) {
      let cell: Result.OneResult;
      // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-unused-vars
      [cell, offset] = await decoders[subType.kind](
        subType,
        buffer,
        offset,
        decoders
      );
      row.push(cell);
    }
    return [row, offset];
  },
  tree: decodeTree,
  table: refuse,
  'materialized-table': refuse,
  'materialized-column': refuse,
  column: refuse,
};

export const valueDecoder = (type: SerializedType): ValueDecoder => {
  const decoder = decoders[type.kind];
  return (buffer, offset) => decoder(type, buffer, offset, decoders);
};
