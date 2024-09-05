/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import DeciNumber from '@decipad/number';
import {
  AnyResult,
  Result,
  ResultGenerator,
  OneResult,
} from 'libs/language-interfaces/src/Result';
import { Specificity } from 'libs/language-interfaces/src/Time';
import { columnToMeta } from './columnToMeta';
import { oneResultToResult } from './oneResultToResult';
import { getResultGenerator } from '@decipad/language-types';
import { all } from '@decipad/generator-utils';
import { SerializedType } from '@decipad/language-interfaces';
import { TreeColumn } from 'libs/language-interfaces/src/Value';
import { Tree } from 'libs/language-types/src/Value';

const FULL_BYTE = 0xff;
const FULL_NIBBLE = 0x80;

// Warning: if you want to add values to this, you must update their corresponding values in Rust too!
enum ResultType {
  Boolean = 0,
  Fraction = 1,
  Float = 2,
  String = 3,
  Column = 4, // All columns are materialized in Rust, so this is a materialized column too
  Date = 5,
  Table = 6,
  Range = 7,
  Row = 8,
  TypeError = 9,
  Pending = 10,
  BigFraction = 11,
  Tree = 12,
  Undefined = 13,
}

const fixedLengths = {
  [ResultType.Fraction]: 16,
  [ResultType.Float]: 8,
  [ResultType.Boolean]: 1,
  [ResultType.TypeError]: 0,
  [ResultType.Pending]: 0,
};

export type SerializedResult = {
  type: BigUint64Array;
  data: Uint8Array;
};

const serializeBigIntToUint8Array = (value: bigint): Uint8Array => {
  // Convert BigInt to little-endian byte array
  const isNegative = value < 0n;
  let absValue = isNegative ? -value : value;
  const bytes: number[] = [];

  do {
    bytes.push(Number(absValue & 255n));
    absValue >>= 8n;
  } while (absValue > 0n);

  // Handle two's complement for negative numbers
  if (isNegative) {
    let carry = 1;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = (~bytes[i] & FULL_BYTE) + carry;
      carry = bytes[i] >> 8;
      bytes[i] &= FULL_BYTE;
    }
    if (carry || (bytes[bytes.length - 1] & FULL_NIBBLE) === 0) {
      bytes.push(FULL_BYTE);
    }
  } else if ((bytes[bytes.length - 1] & FULL_NIBBLE) !== 0) {
    bytes.push(0);
  }

  // Create buffer with 4 bytes for length + bytes for the value
  const buffer = new Uint8Array(4 + bytes.length);

  // Write length (4 bytes, big-endian)
  const len = bytes.length;
  buffer[0] = len & FULL_BYTE;
  buffer[1] = (len >> 8) & FULL_BYTE;
  buffer[2] = (len >> 16) & FULL_BYTE;
  buffer[3] = (len >> 24) & FULL_BYTE;
  // Write BigInt bytes
  buffer.set(bytes, 4);

  return buffer;
};

const deserializeUint8ArrayToBigInt = (
  buffer: Uint8Array,
  offset: number,
  length: number
): bigint => {
  if (buffer.length < offset) {
    throw new Error(
      'Buffer is too short to contain a valid serialized BigInt at the given offset'
    );
  }

  // Read the length (4 bytes, big-endian)
  if (buffer.length < offset + length) {
    throw new Error('Buffer length does not match the encoded length');
  }

  // Extract the BigInt bytes
  const bytes = buffer.slice(offset, offset + length);

  // Determine if the number is negative (check the most significant bit)
  const isNegative = (bytes[bytes.length - 1] & FULL_NIBBLE) !== 0;

  // Convert bytes to BigInt
  let value = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << 8n) | BigInt(bytes[i]);
  }

  // Handle two's complement for negative numbers
  if (isNegative) {
    const mask = (1n << BigInt(8 * bytes.length)) - 1n;
    value = -((~value & mask) + 1n);
  }

  return value;
};

const serializeDeciNumber = (
  deciNumber: DeciNumber
): [Uint8Array, Uint8Array] => {
  const { s, n = 1n, d = 1n, infinite = false } = deciNumber;
  let numerator: bigint;
  let denominator: bigint;
  if (infinite) {
    numerator = s || 1n;
    denominator = 0n;
  } else {
    numerator = s ? n * s : n;
    denominator = d;
  }

  const encodedNumerator = serializeBigIntToUint8Array(numerator);

  const encodeDenominator = serializeBigIntToUint8Array(denominator);

  return [encodedNumerator, encodeDenominator];
};

// Used to represent null values in metadata
const nullColumn: Result<'materialized-column'> = {
  type: {
    kind: 'materialized-column',
    cellType: { kind: 'anything' },
    indexedBy: null,
  },
  value: [],
};

// eslint-disable-next-line complexity
export const serializeResultIter = async <T extends Result>(
  results: (T | undefined)[],
  typeArray: number[],
  dataArray: Uint8Array[],
  dataLength = { n: 0 } // allow this value to be mutated globally
) => {
  const nextResults: (AnyResult | undefined)[] = [];
  const initialTypeArrayLength = typeArray.length;

  // leaving this unused for now; but will be needed to compress data at some point
  for (const result of results) {
    if (result === undefined) {
      typeArray.push(ResultType.Undefined);
      typeArray.push(0);
      typeArray.push(0);
      continue;
    }
    switch (result.type.kind) {
      case 'boolean': {
        const { value } = result as Result<'boolean'>;
        const data = new Uint8Array([value ? 1 : 0]);
        dataArray.push(data);

        typeArray.push(ResultType.Boolean);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Boolean]);
        dataLength.n += fixedLengths[ResultType.Boolean];
        break;
      }
      case 'number': {
        const [encodedNumerator, encodedDenominator] = serializeDeciNumber(
          (result as Result<'number'>).value
        );

        dataArray.push(encodedNumerator);

        dataArray.push(encodedDenominator);

        const length = encodedNumerator.length + encodedDenominator.length;
        typeArray.push(ResultType.BigFraction);
        typeArray.push(dataLength.n);
        typeArray.push(length);
        dataLength.n += length;
        break;
      }
      case 'date': {
        const { value } = result as Result<'date'>;
        const specificity = result.type.date;
        dataArray.push(new Uint8Array([timeSpecificityToNumber(specificity)]));
        let contentLength = 1; // 1 is length of specificity
        if (value !== undefined) {
          const data = new Uint8Array(new BigUint64Array([value]).buffer);
          dataArray.push(data);
          contentLength += 8;
        }

        typeArray.push(ResultType.Date);
        typeArray.push(dataLength.n);
        typeArray.push(contentLength);
        dataLength.n += contentLength;
        break;
      }
      case 'string': {
        const { value } = result as Result<'string'>;
        const data = new TextEncoder().encode(value);
        dataArray.push(data);

        typeArray.push(ResultType.String);
        typeArray.push(dataLength.n);
        typeArray.push(data.length);
        dataLength.n += data.length;
        break;
      }
      case 'column': {
        const columnResult = result as Result<'column'>;
        typeArray.push(ResultType.Column);
        typeArray.push(-1); // Placeholder value; fixed after loop.

        let childCount = 0;
        const contents = await all(getResultGenerator(columnResult.value)());
        for (const value of contents) {
          childCount += 1;
          nextResults.push({
            value,
            type: columnResult.type.cellType,
          });
        }
        typeArray.push(childCount);
        break;
      }
      case 'table': {
        // [indexName, delegatesIndexTo, columnNames[], columns[]]
        // Note: indexName and delegatesIndexTo are nullable, we use an empty column to represent null
        const tableResult = result as Result<'table'>;
        typeArray.push(ResultType.Table);
        typeArray.push(-1); // Placeholder value; fixed after loop.

        nextResults.push(
          tableResult.type.indexName == null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.indexName,
                meta: tableResult.meta,
              }
        );
        nextResults.push(
          tableResult.type.delegatesIndexTo == null // == because it can be undefined or null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.delegatesIndexTo,
                meta: undefined,
              }
        );
        for (const columnName of tableResult.type.columnNames) {
          nextResults.push({
            type: { kind: 'string' },
            value: columnName,
            meta: undefined,
          });
        }

        let childCount = 0;
        for await (const value of tableResult.value) {
          const cellType = result.type.columnTypes[childCount];

          if (cellType === undefined) {
            throw new Error('Column type not found');
          }
          nextResults.push({
            value,
            type: {
              kind: 'column',
              cellType,
              indexedBy: 'number',
            },
            meta: tableResult.meta?.bind(tableResult),
          });
          childCount += 1;
        }
        typeArray.push(childCount);
        break;
      }

      case 'tree': {
        // root
        // rootAggregation | undefined
        // originalCardinality
        // columnLength
        // ...([name, aggregation | undefined][])
        // children[]
        const treeResult = result as Result<'tree'>;

        typeArray.push(ResultType.Tree);
        typeArray.push(-1); // Placeholder value; fixed after loop.

        const { value } = treeResult;

        // write the root, OneResult
        nextResults.push(oneResultToResult(value.root));

        // write the root aggregation, Result | undefined
        nextResults.push(value.rootAggregation);

        // write the original cardinality, number
        nextResults.push({
          type: { kind: 'number' },
          value: new DeciNumber(value.originalCardinality),
        });

        // write the coulumn length count
        nextResults.push({
          type: { kind: 'number' },
          value: new DeciNumber(value.columns.length),
        });

        value.columns.forEach((column) => {
          nextResults.push({
            type: { kind: 'string' },
            value: column.name,
          });
          nextResults.push(column.aggregation);
        });

        nextResults.push({
          type: { kind: 'number' },
          value: new DeciNumber(value.children.length),
        });

        value.children.forEach((child) => {
          nextResults.push({
            type: { kind: 'tree', columnNames: [], columnTypes: [] },
            value: child,
          });
        });

        typeArray.push(5 + 2 * value.columns.length + value.children.length);
        break;
      }

      case 'materialized-column': {
        const columnResult = result as Result<'materialized-column'>;
        typeArray.push(ResultType.Column);
        typeArray.push(-1); // Placeholder value; fixed after loop.

        for (let i = 0; i < columnResult.value.length; i++) {
          const value = columnResult.value[i];
          nextResults.push({
            value,
            type: columnResult.type.cellType,
            meta: columnResult.meta,
          });
        }
        typeArray.push(columnResult.value.length);
        break;
      }

      case 'materialized-table': {
        // [indexName, delegatesIndexTo, ...columnNames, ...columns]
        // Note: indexName and delegatesIndexTo are nullable, we use an empty column to represent null
        const tableResult = result as Result<'materialized-table'>;
        typeArray.push(ResultType.Table);
        typeArray.push(-1); // Placeholder value; fixed after loop.
        typeArray.push(tableResult.value.length);

        nextResults.push(
          tableResult.type.indexName == null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.indexName,
                meta: undefined,
              }
        );
        nextResults.push(
          tableResult.type.delegatesIndexTo == null // == because it can be undefined or null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.delegatesIndexTo,
                meta: undefined,
              }
        );
        for (const columnName of tableResult.type.columnNames) {
          nextResults.push({
            type: { kind: 'string' },
            value: columnName,
            meta: undefined,
          });
        }

        for (let i = 0; i < tableResult.value.length; i++) {
          const value = tableResult.value[i];
          const cellType = result.type.columnTypes[i];

          if (cellType === undefined) {
            throw new Error('Column type not found');
          }
          nextResults.push({
            value,
            type: {
              kind: 'materialized-column',
              cellType,
              indexedBy: 'number',
            },
            meta: columnToMeta(value),
          });
        }
        break;
      }

      case 'range': {
        const rangeResult = result as Result<'range'>;
        typeArray.push(ResultType.Range);
        typeArray.push(dataLength.n);

        let startDeciNumber: DeciNumber;
        let endDeciNumber: DeciNumber;
        if (
          typeof rangeResult.value[0] === 'bigint' &&
          typeof rangeResult.value[1] === 'bigint'
        ) {
          startDeciNumber = new DeciNumber(rangeResult.value[0]);
          endDeciNumber = new DeciNumber(rangeResult.value[1]);
        } else if (
          rangeResult.value[0] instanceof DeciNumber &&
          rangeResult.value[1] instanceof DeciNumber
        ) {
          startDeciNumber = rangeResult.value[0];
          endDeciNumber = rangeResult.value[1];
        } else {
          throw new Error('Invalid range value');
        }

        const startEncoded = serializeDeciNumber(startDeciNumber);
        const endEncoded = serializeDeciNumber(endDeciNumber);

        dataArray.push(startEncoded[0]);
        dataArray.push(startEncoded[1]);
        dataArray.push(endEncoded[0]);
        dataArray.push(endEncoded[1]);
        const length =
          startEncoded[0].length +
          startEncoded[1].length +
          endEncoded[0].length +
          endEncoded[1].length;
        typeArray.push(length);
        dataLength.n += length;
        break;
      }

      case 'row': {
        // [rowIndexName] [cell1Name] [cell1Value] [cell2Name] [cell2Value] ... [cellNType] [cellNValue]
        const rowResult = result as Result<'row'>;
        typeArray.push(ResultType.Row);
        typeArray.push(-1); // Placeholder value; fixed after loop.
        typeArray.push(rowResult.value.length);

        nextResults.push({
          value: rowResult.type.rowIndexName,
          type: { kind: 'string' },
          meta: undefined,
        });

        for (let i = 0; i < rowResult.value.length; i++) {
          const type = result.type.rowCellTypes[i];
          if (!type) {
            throw new Error('Cell type not found');
          }
          const cellName = rowResult.type.rowCellNames[i];
          nextResults.push({
            value: cellName,
            type: { kind: 'string' },
            meta: undefined,
          });

          const value = rowResult.value[i];
          nextResults.push({
            value,
            type,
            meta: undefined,
          });
        }
        break;
      }

      case 'type-error': {
        typeArray.push(ResultType.TypeError);
        typeArray.push(dataLength.n);
        typeArray.push(0);
        break;
      }
      case 'pending': {
        typeArray.push(ResultType.Pending);
        typeArray.push(dataLength.n);
        typeArray.push(0);
        break;
      }
    }
  }

  // Time to fix those placeholder values
  let offset = typeArray.length / 3;
  for (let i = initialTypeArrayLength; i < typeArray.length; i += 3) {
    if (
      typeArray[i] !== ResultType.Column &&
      typeArray[i] !== ResultType.Table &&
      typeArray[i] !== ResultType.Row &&
      typeArray[i] !== ResultType.Tree
    ) {
      continue;
    }
    typeArray[i + 1] = offset;
    offset += typeArray[i + 2];
  }

  if (nextResults.length > 0) {
    await serializeResultIter(nextResults, typeArray, dataArray, dataLength);
  }
};

export const serializeResult = async (
  result: AnyResult
): Promise<SerializedResult> => {
  const typeArray: number[] = [];
  const dataArray: Uint8Array[] = [];
  const dataLength = { n: 0 };

  await serializeResultIter([result], typeArray, dataArray, dataLength);

  const totalTypeLength = typeArray.length;
  const type = new BigUint64Array(totalTypeLength);

  for (let i = 0; i < totalTypeLength; i++) {
    type[i] = BigInt(typeArray[i]);
  }

  const totalDataLength = dataLength.n;
  const data = new Uint8Array(totalDataLength);
  let offset = 0;

  for (const arr of dataArray) {
    data.set(arr, offset);
    offset += arr.length;
  }

  return { type, data };
};

function decodeNumber(number: bigint): [boolean, ResultType] {
  const firstBit = (number & BigInt(1 << 63)) !== BigInt(0);
  const originalNumber = Number(
    number & ((BigInt(1) << BigInt(63)) - BigInt(1))
  );

  let result: ResultType;
  switch (originalNumber) {
    case 0:
      result = ResultType.Boolean;
      break;
    case 1:
      result = ResultType.Fraction;
      break;
    case 2:
      result = ResultType.Float;
      break;
    case 3:
      result = ResultType.String;
      break;
    case 4:
      result = ResultType.Column;
      break;
    case 5:
      result = ResultType.Date;
      break;
    case 6:
      result = ResultType.Table;
      break;
    case 7:
      result = ResultType.Range;
      break;
    case 8:
      result = ResultType.Row;
      break;
    case 9:
      result = ResultType.TypeError;
      break;
    case 10:
      result = ResultType.Pending;
      break;
    case 11:
      result = ResultType.BigFraction;
      break;
    case 12:
      result = ResultType.Tree;
      break;
    case 13:
      result = ResultType.Undefined;
      break;
    default:
      throw new Error(`Invalid ResultType value: ${originalNumber}`);
  }

  return [firstBit, result];
}

function readInt64FromUint8Array(array: Uint8Array, offset: number): bigint {
  const buffer = array.slice(offset, offset + 8);
  return BigInt(new DataView(buffer.buffer).getBigInt64(0, true));
}

const timeSpecificityToNumber = (specificity: Specificity): number => {
  switch (specificity) {
    case 'undefined':
      return 0;
    case 'year':
      return 1;
    case 'quarter':
      return 2;
    case 'month':
      return 3;
    case 'day':
      return 4;
    case 'hour':
      return 5;
    case 'minute':
      return 6;
    case 'second':
      return 7;
    case 'millisecond':
      return 8;
  }
};

const numberToTimeSpecificity = (number: number): Specificity => {
  switch (number) {
    case 0:
      return 'undefined';
    case 1:
      return 'year';
    case 2:
      return 'quarter';
    case 3:
      return 'month';
    case 4:
      return 'day';
    case 5:
      return 'hour';
    case 6:
      return 'minute';
    case 7:
      return 'second';
    case 8:
      return 'millisecond';
    default:
      throw new Error(`Invalid time specificity number: ${number}`);
  }
};

// eslint-disable-next-line complexity
const deserializeResultIter = (
  data: Uint8Array,
  typeDescription: bigint[],
  typeDescriptionPointer = 0
): Result | undefined => {
  const [isCompressed, resultType] = decodeNumber(
    typeDescription[3 * typeDescriptionPointer]
  );

  if (isCompressed) {
    throw new Error('Compressed data is not supported at the top level');
  }

  const offset = Number(typeDescription[3 * typeDescriptionPointer + 1]);
  const length = Number(typeDescription[3 * typeDescriptionPointer + 2]);

  switch (resultType) {
    case ResultType.Boolean: {
      return {
        type: { kind: 'boolean' },
        value: data[offset] !== 0,
        meta: undefined,
      };
    }

    case ResultType.Fraction: {
      const numerator = readInt64FromUint8Array(data, offset);
      const denominator = readInt64FromUint8Array(data, offset + 8);
      let deciNumber: DeciNumber;
      if (denominator === 0n && numerator > 0n) {
        deciNumber = new DeciNumber({ infinite: true });
      } else if (denominator === 0n && numerator < 0n) {
        deciNumber = new DeciNumber({ infinite: true, s: -1 });
      } else {
        deciNumber = new DeciNumber({ n: numerator, d: denominator, s: 1n });
      }
      return {
        type: { kind: 'number' },
        value: deciNumber,
        meta: undefined,
      };
    }

    case ResultType.Date: {
      const specificity = numberToTimeSpecificity(Number(data[offset]));
      const value =
        length === 1 ? undefined : readInt64FromUint8Array(data, offset + 1);
      return {
        type: { kind: 'date', date: specificity },
        value,
        meta: undefined,
      };
    }

    case ResultType.String: {
      const buffer = data.slice(offset, offset + length);
      const value = new TextDecoder().decode(buffer);
      return { type: { kind: 'string' }, value, meta: undefined };
    }

    case ResultType.Float: {
      throw new Error('Floats are not supported yet');
    }

    case ResultType.Column: {
      const [isCompressed] = decodeNumber(typeDescription[3]);
      const dataTypeOffset = offset;
      const dataTypeLength = length;

      let generator: ResultGenerator;
      if (!isCompressed) {
        generator = async function* () {
          for (
            let i = dataTypeOffset;
            i < dataTypeOffset + dataTypeLength;
            i++
          ) {
            yield (deserializeResultIter(data, typeDescription, i) as AnyResult)
              .value as OneResult;
          }
        };
      } else {
        generator = async function* () {
          const itemCount = Number(typeDescription[4]);
          const itemLength = Number(typeDescription[5]);
          for (let i = 0; i < itemCount; i++) {
            const newOffset = offset + i * itemLength;
            const typeDescriptionSlice = [...typeDescription.slice(3)];
            typeDescriptionSlice[0] &= (BigInt(1) << BigInt(63)) - BigInt(1);
            typeDescriptionSlice[1] = BigInt(newOffset);
            typeDescriptionSlice[2] = BigInt(itemLength);

            // TODO get rid of "as"
            yield (
              deserializeResultIter(data, typeDescriptionSlice) as AnyResult
            ).value as OneResult;
          }
        };
      }

      let cellType: SerializedType;
      if (dataTypeLength > 0) {
        const firstResult = deserializeResultIter(
          data,
          typeDescription,
          dataTypeOffset
        );
        if (firstResult === undefined) {
          throw new Error('First result is undefined');
        }

        cellType = firstResult.type;
      } else {
        cellType = {
          kind: 'anything',
        };
      }

      return {
        type: {
          kind: 'column',
          cellType,
          indexedBy: 'number',
        },
        value: generator,
        meta: columnToMeta(generator),
      };
    }

    case ResultType.Range: {
      deserializeUint8ArrayToBigInt;
      const bigints: bigint[] = [];

      let ptr = offset;
      for (let i = 0; i < 4; i++) {
        const length =
          data[ptr] |
          (data[ptr + 1] << 8) |
          (data[ptr + 2] << 16) |
          (data[ptr + 3] << 24);
        ptr += 4;
        bigints.push(deserializeUint8ArrayToBigInt(data, ptr, length));
        ptr += length;
      }

      const start = new DeciNumber({
        n: bigints[0],
        d: bigints[1],
        s: 1n,
      });
      const end = new DeciNumber({
        n: bigints[2],
        d: bigints[3],
        s: 1n,
      });
      return {
        type: {
          kind: 'range',
          rangeOf: {
            kind: 'number',
          },
        },
        value: [start, end],
        meta: undefined,
      };
    }

    case ResultType.Table: {
      const childCount = Number(typeDescription[typeDescriptionPointer + 2]);
      const indexNameResult = deserializeResultIter(
        data,
        typeDescription,
        typeDescriptionPointer + 1
      );
      if (indexNameResult === undefined) {
        throw new Error('Index name result is undefined');
      }
      const indexName =
        indexNameResult.type.kind === 'string'
          ? (indexNameResult.value as string)
          : null;

      const delegatesIndexToResult = deserializeResultIter(
        data,
        typeDescription,
        typeDescriptionPointer + 2
      );
      if (delegatesIndexToResult === undefined) {
        throw new Error('Delegates index to result is undefined');
      }
      const delegatesIndexTo =
        delegatesIndexToResult.type.kind === 'string'
          ? (delegatesIndexToResult.value as string)
          : null;

      const columnNames: string[] = [];
      for (let i = 0; i < childCount; i++) {
        const res = deserializeResultIter(
          data,
          typeDescription,
          typeDescriptionPointer + 3 + i
        );
        if (res === undefined) {
          throw new Error('Column name result is undefined');
        }
        if (res.type.kind !== 'string') {
          throw new Error('Expected string');
        }
        columnNames.push(res.value as string);
      }

      const columnTypes: Result['type'][] = [];
      const columns: Result<'column'>[] = [];
      for (let i = 0; i < childCount; i++) {
        const res = deserializeResultIter(
          data,
          typeDescription,
          typeDescriptionPointer + 3 + childCount + i
        ) as Result<'column'>;
        columnTypes.push(res.type.cellType);
        columns.push(res);
      }

      return {
        type: {
          kind: 'table',
          columnTypes,
          columnNames,
          delegatesIndexTo,
          indexName,
        },
        value: columns.map((col) => col.value),
        meta: columnToMeta(columns[0].value),
      };
    }

    case ResultType.Tree: {
      let tdp = Number(typeDescription[typeDescriptionPointer * 3 + 1]);
      const root = deserializeResultIter(data, typeDescription, tdp);
      if (root === undefined) {
        throw new Error('Root is undefined');
      }
      if (root.value === null) {
        throw new Error('Root is null');
      }
      tdp += 1;
      const rootAggregation = deserializeResultIter(data, typeDescription, tdp);

      tdp += 1;
      const originalCardinalityDeciNum = deserializeResultIter(
        data,
        typeDescription,
        tdp
      ) as Result<'number'>;
      if (originalCardinalityDeciNum.type.kind !== 'number') {
        throw new Error(
          `Expected number, got ${originalCardinalityDeciNum.type.kind}`
        );
      }
      const originalCardinality = Number(originalCardinalityDeciNum.value.n);

      tdp += 1;
      const columnLength = deserializeResultIter(
        data,
        typeDescription,
        tdp
      ) as Result<'number'>;

      if (
        columnLength.type.kind !== 'number' ||
        columnLength.value.n === undefined
      ) {
        throw new Error('Expected number');
      }

      let i = 0;
      let columns: TreeColumn[] = [];
      const l = Number(columnLength.value.n);
      while (i < l) {
        tdp += 1;
        const columnName = deserializeResultIter(
          data,
          typeDescription,
          tdp
        ) as Result<'string'>;

        if (columnName.type.kind !== 'string') {
          throw new Error('Expected string');
        }

        tdp += 1;
        let aggregation = deserializeResultIter(data, typeDescription, tdp);
        columns.push({ name: columnName.value, aggregation: aggregation });
        i += 1;
      }

      tdp += 1;
      let childCountDeciNum = deserializeResultIter(
        data,
        typeDescription,
        tdp
      ) as Result<'number'>;

      const childCount = Number(childCountDeciNum.value.n);

      let j = 0;
      const children: Tree[] = [];
      while (j < childCount) {
        tdp += 1;
        const child = deserializeResultIter(
          data,
          typeDescription,
          tdp
        ) as Result<'tree'>;
        children.push(child.value);
        j += 1;
      }

      const treeResult: Result<'tree'> = {
        type: {
          kind: 'tree',
          columnNames: [], // TODO
          columnTypes: [], // TODO
        },
        value: Tree.from(
          root.value,
          rootAggregation,
          children,
          columns,
          originalCardinality
        ),
      };
      return treeResult as Result;
    }

    case ResultType.Row: {
      const rowLength = Number(typeDescription[3 * typeDescriptionPointer + 2]);
      const rowCells: OneResult[] = [];
      const rowCellNames: string[] = [];
      const rowCellTypes: Result['type'][] = [];

      const rowIndexNameResult = deserializeResultIter(
        data,
        typeDescription,
        typeDescriptionPointer + 1
      );
      if (rowIndexNameResult === undefined) {
        throw new Error('Row index name result is undefined');
      }
      if (rowIndexNameResult.type.kind !== 'string') {
        throw new Error('Row index name is not a string');
      }
      const rowIndexName = (rowIndexNameResult as Result<'string'>).value;
      for (let i = 0; i < rowLength; i++) {
        const cellNameresult = deserializeResultIter(
          data,
          typeDescription,
          typeDescriptionPointer + 2 + 2 * i
        );
        if (cellNameresult === undefined) {
          throw new Error('Cell name result is undefined');
        }
        if (cellNameresult.type.kind !== 'string') {
          throw new Error('Cell name is not a string');
        }
        const cellName = (cellNameresult as Result<'string'>).value;

        const cellResult = deserializeResultIter(
          data,
          typeDescription,
          typeDescriptionPointer + 2 + 2 * i + 1
        );
        if (cellResult === undefined) {
          throw new Error('Cell result is undefined');
        }
        rowCells.push(cellResult.value as OneResult);
        rowCellNames.push(cellName);
        rowCellTypes.push(cellResult.type);
      }

      return {
        type: {
          kind: 'row',
          rowCellTypes,
          rowCellNames,
          rowIndexName,
        },
        value: rowCells,
        meta: undefined,
      };
    }

    case ResultType.BigFraction: {
      const numeratorLength =
        data[offset] |
        (data[offset + 1] << 8) |
        (data[offset + 2] << 16) |
        (data[offset + 3] << 24);

      const numerator = deserializeUint8ArrayToBigInt(
        data,
        offset + 4,
        numeratorLength
      );
      const newOffset = offset + numeratorLength + 4;
      const denominatorLength =
        data[newOffset] |
        (data[newOffset + 1] << 8) |
        (data[newOffset + 2] << 16) |
        (data[newOffset + 3] << 24);
      const denominator = deserializeUint8ArrayToBigInt(
        data,
        newOffset + 4,
        denominatorLength
      );

      let deciNumber: DeciNumber;
      if (denominator === 0n && numerator > 0n) {
        deciNumber = new DeciNumber({ infinite: true });
      } else if (denominator === 0n && numerator < 0n) {
        deciNumber = new DeciNumber({ infinite: true, s: -1 });
      } else {
        deciNumber = new DeciNumber({ n: numerator, d: denominator, s: 1n });
      }
      return {
        type: { kind: 'number' },
        value: deciNumber,
      };
    }

    case ResultType.TypeError: {
      return {
        type: {
          kind: 'type-error',
          errorCause: {
            errType: 'free-form',
            // This isn't ideal, but would require a lot of work on the Rust side to make it better.
            message: 'Error message lost in ABI translation.',
          },
        },
        value: undefined,
        meta: undefined,
      };
    }

    case ResultType.Pending: {
      return { type: { kind: 'pending' }, value: undefined, meta: undefined };
    }
    case ResultType.Undefined: {
      return undefined;
    }
  }
};

export const deserializeResult = (val: {
  type: BigUint64Array;
  data: Uint8Array;
}): Result => {
  const typeDescription = Array.from(val.type); // TODO consider passing BigUint64Array directly
  const result = deserializeResultIter(val.data, typeDescription);
  // should never be undefined at the top level
  if (result === undefined) {
    throw new Error('Result is undefined');
  }
  return result;
};
