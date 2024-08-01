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
  // Function = 11,
  // Tree = 12,
}

const fixedLengths = {
  [ResultType.Fraction]: 16,
  [ResultType.Range]: 32,
  [ResultType.Float]: 8,
  [ResultType.Boolean]: 1,
  [ResultType.TypeError]: 0,
  [ResultType.Pending]: 0,
};

export type SerializedResult = {
  type: BigUint64Array;
  data: Uint8Array;
};

const deciNumberToUint8Array = (deciNumber: DeciNumber): Uint8Array => {
  const { s, n = 1n, d = 1n, infinite = false } = deciNumber;
  const ns = s === undefined ? 1 : s < 0 ? -1 : 1;

  const bigintArray = new BigInt64Array([
    BigInt(ns) * (n || 0n),
    infinite ? 0n : d || 0n,
  ]);
  return new Uint8Array(bigintArray.buffer);
};

// Used to represent null values in metadata
const nullColumn: Result<'column'> = {
  type: {
    kind: 'column',
    cellType: { kind: 'anything' },
    indexedBy: null,
  },
  value: [] as any,
};

export const serializeResultIter = async <T extends Result>(
  results: T[],
  typeArray: number[],
  dataArray: Uint8Array[],
  dataLength = { n: 0 } // allow this value to be mutated globally
) => {
  const nextResults: AnyResult[] = [];
  const initialTypeArrayLength = typeArray.length;

  // leaving this unused for now; but will be needed to compress data at some point
  for (const result of results) {
    switch (result.type.kind) {
      case 'boolean': {
        const value = (result as Result<'boolean'>).value;
        const data = new Uint8Array([value ? 1 : 0]);
        dataArray.push(data);

        typeArray.push(ResultType.Boolean);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Boolean]);
        dataLength.n += fixedLengths[ResultType.Boolean];
        break;
      }
      case 'number': {
        dataArray.push(
          deciNumberToUint8Array((result as Result<'number'>).value)
        );

        typeArray.push(ResultType.Fraction);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Fraction]);
        dataLength.n += fixedLengths[ResultType.Fraction];
        break;
      }
      case 'date': {
        const value = (result as Result<'date'>).value;
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
        const value = (result as Result<'string'>).value;
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
        // TODO use: all(columnResult.value());
        for await (const value of columnResult.value()) {
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
              }
        );
        nextResults.push(
          tableResult.type.delegatesIndexTo == null // == because it can be undefined or null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.delegatesIndexTo,
              }
        );
        for (const columnName of tableResult.type.columnNames) {
          nextResults.push({
            type: { kind: 'string' },
            value: columnName,
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
          });
          childCount += 1;
        }
        typeArray.push(childCount);
        break;
      }
      case 'materialized-column': {
        const columnResult = result as Result<'materialized-column'>;
        typeArray.push(ResultType.Column);
        typeArray.push(-1); // Placeholder value; fixed after loop.

        // TODO use: all(columnResult.value());
        for (let i = 0; i < columnResult.value.length; i++) {
          const value = columnResult.value[i];
          nextResults.push({
            value,
            type: columnResult.type.cellType,
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
              }
        );
        nextResults.push(
          tableResult.type.delegatesIndexTo == null // == because it can be undefined or null
            ? nullColumn
            : {
                type: { kind: 'string' },
                value: tableResult.type.delegatesIndexTo,
              }
        );
        for (const columnName of tableResult.type.columnNames) {
          nextResults.push({
            type: { kind: 'string' },
            value: columnName,
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
          });
        }
        break;
      }

      case 'range': {
        const rangeResult = result as Result<'range'>;
        typeArray.push(ResultType.Range);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Range]);
        dataLength.n += fixedLengths[ResultType.Range];

        if (
          typeof rangeResult.value[0] === 'bigint' &&
          typeof rangeResult.value[1] === 'bigint'
        ) {
          dataArray.push(
            deciNumberToUint8Array(new DeciNumber(rangeResult.value[0]))
          );
          dataArray.push(
            deciNumberToUint8Array(new DeciNumber(rangeResult.value[1]))
          );
        } else if (
          rangeResult.value[0] instanceof DeciNumber &&
          rangeResult.value[1] instanceof DeciNumber
        ) {
          dataArray.push(deciNumberToUint8Array(rangeResult.value[0]));
          dataArray.push(deciNumberToUint8Array(rangeResult.value[1]));
        } else {
          throw new Error('Invalid range value');
        }
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
          });

          const value = rowResult.value[i];
          nextResults.push({
            value,
            type,
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
      typeArray[i] !== ResultType.Row
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
    default:
      throw new Error(`Invalid ResultType value: ${originalNumber}`);
  }

  return [firstBit, result];
}

function readBigIntFromUint8Array(array: Uint8Array, offset: number): bigint {
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

const deserializeResultIter = (
  data: Uint8Array,
  typeDescription: bigint[],
  typeDescriptionPointer = 0
): Result => {
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
      return { type: { kind: 'boolean' }, value: data[offset] !== 0 };
    }

    case ResultType.Fraction: {
      const numerator = readBigIntFromUint8Array(data, offset);
      const denominator = readBigIntFromUint8Array(data, offset + 8);
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

    case ResultType.Date: {
      const specificity = numberToTimeSpecificity(Number(data[offset]));
      const value =
        length === 1 ? undefined : readBigIntFromUint8Array(data, offset + 1);
      return { type: { kind: 'date', date: specificity }, value };
    }

    case ResultType.String: {
      const buffer = data.slice(offset, offset + length);
      const value = new TextDecoder().decode(buffer);
      return { type: { kind: 'string' }, value };
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
            yield deserializeResultIter(data, typeDescription, i)
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
            typeDescriptionSlice[0] =
              typeDescriptionSlice[0] & ((BigInt(1) << BigInt(63)) - BigInt(1));
            typeDescriptionSlice[1] = BigInt(newOffset);
            typeDescriptionSlice[2] = BigInt(itemLength);

            // TODO get rid of "as"
            yield deserializeResultIter(data, typeDescriptionSlice)
              .value as OneResult;
          }
        };
      }

      const firstResult = deserializeResultIter(
        data,
        typeDescription,
        dataTypeOffset
      );
      const cellType = firstResult.type;

      return {
        type: {
          kind: 'column',
          cellType,
          indexedBy: 'number',
        },
        value: generator,
      };
    }

    case ResultType.Range: {
      const start = new DeciNumber({
        n: readBigIntFromUint8Array(data, offset),
        d: readBigIntFromUint8Array(data, offset + 8),
        s: 1n,
      });
      const end = new DeciNumber({
        n: readBigIntFromUint8Array(data, offset + 16),
        d: readBigIntFromUint8Array(data, offset + 24),
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
      };
    }

    case ResultType.Table: {
      const childCount = Number(typeDescription[typeDescriptionPointer + 2]);
      const indexNameResult = deserializeResultIter(
        data,
        typeDescription,
        typeDescriptionPointer + 1
      );
      const indexName =
        indexNameResult.type.kind === 'string'
          ? (indexNameResult.value as string)
          : null;

      const delegatesIndexToResult = deserializeResultIter(
        data,
        typeDescription,
        typeDescriptionPointer + 2
      );
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
      };
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
        if (cellNameresult.type.kind !== 'string') {
          throw new Error('Cell name is not a string');
        }
        const cellName = (cellNameresult as Result<'string'>).value;

        const cellResult = deserializeResultIter(
          data,
          typeDescription,
          typeDescriptionPointer + 2 + 2 * i + 1
        );
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
      };
    }

    case ResultType.Pending: {
      return { type: { kind: 'pending' }, value: undefined };
    }
  }
};

export const deserializeResult = (val: {
  type: BigUint64Array;
  data: Uint8Array;
}): Result => {
  const typeDescription = Array.from(val.type); // TODO consider passing BigUint64Array directly
  const result = deserializeResultIter(val.data, typeDescription);
  return result;
};
