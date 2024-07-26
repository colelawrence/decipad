/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import DeciNumber from '@decipad/number';
import {
  AnyResult,
  ResultNumber,
  ResultString,
  ResultBoolean,
  Result,
  ResultGenerator,
  OneResult,
} from 'libs/language-interfaces/src/Result';

// Warning: if you want to add values to this, you must update their corresponding values in Rust too!
// eslint-disable-next-line no-shadow
enum ResultType {
  Boolean,
  Fraction,
  Float,
  String,
  Column,
}

const fixedLengths = {
  [ResultType.Fraction]: 16,
  [ResultType.Float]: 8,
  [ResultType.Boolean]: 1,
};

export type SerializedResult = {
  type: BigUint64Array;
  data: Uint8Array;
};

export const serializeResultForRustIter = async <T extends AnyResult>(
  results: T[],
  typeArray: number[],
  dataArray: Uint8Array[],
  dataLength = { n: 0 } // allow this value to be mutated globally
) => {
  const nextResults: AnyResult[] = [];
  const initialTypeArrayLength = typeArray.length;
  let dataArrayLength = dataArray.length;
  let childLength: number | undefined;

  // leaving this unused for now; but will be needed to compress data at some point
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const result of results) {
    switch (result.type.kind) {
      case 'boolean': {
        const value = result.value as ResultBoolean;
        const data = new Uint8Array([value ? 1 : 0]);
        dataArray.push(data);

        typeArray.push(ResultType.Boolean);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Boolean]);
        dataLength.n += fixedLengths[ResultType.Boolean];
        break;
      }
      case 'number': {
        const value = result.value as ResultNumber;
        const { s, n = 1n, d = 1n, infinite = false } = value;
        const ns = s === undefined ? 1 : s < 0 ? -1 : 1;

        const data = new BigInt64Array([
          BigInt(ns) * (n || 0n),
          infinite ? 0n : d || 0n,
        ]);

        dataArray.push(new Uint8Array(data.buffer));

        typeArray.push(ResultType.Fraction);
        typeArray.push(dataLength.n);
        typeArray.push(fixedLengths[ResultType.Fraction]);
        dataLength.n += fixedLengths[ResultType.Fraction];
        break;
      }
      case 'string': {
        const value = result.value as ResultString;
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
    }
    const lengthDelta = dataArrayLength - dataArray.length;
    dataArrayLength = dataArray.length;
    if (childLength === undefined) {
      childLength = lengthDelta;
    } else if (childLength !== lengthDelta) {
      // childrenHaveUniformLength = false;
    }
  }

  // Time to fix those placeholder values
  let offset = typeArray.length / 3;
  for (let i = initialTypeArrayLength; i < typeArray.length; i += 3) {
    if (typeArray[i] !== 4) break;
    typeArray[i + 1] = offset;
    offset += typeArray[i + 2];
  }

  if (nextResults.length > 0) {
    await serializeResultForRustIter(
      nextResults,
      typeArray,
      dataArray,
      dataLength
    );
  }
};

export const serializeResultForRust = async (
  result: AnyResult
): Promise<SerializedResult> => {
  const typeArray: number[] = [];
  const dataArray: Uint8Array[] = [];
  const dataLength = { n: 0 };

  await serializeResultForRustIter([result], typeArray, dataArray, dataLength);

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
    default:
      throw new Error(`Invalid ResultType value: ${originalNumber}`);
  }

  return [firstBit, result];
}

function readBigIntFromUint8Array(array: Uint8Array, offset: number): bigint {
  const buffer = array.slice(offset, offset + 8);
  return BigInt(new DataView(buffer.buffer).getBigInt64(0, true));
}

const decodeData = (
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

    case ResultType.String: {
      const buffer = data.slice(offset, offset + length);
      const value = new TextDecoder().decode(buffer);
      return { type: { kind: 'string' }, value };
    }

    case ResultType.Float: {
      throw new Error('Floats are not supported yet');
    }

    case ResultType.Column: {
      const [isCompressedColumn] = decodeNumber(typeDescription[3]);
      const dataTypeOffset = offset;
      const dataTypeLength = length;

      let generator: ResultGenerator;
      if (!isCompressedColumn) {
        generator = async function* columnGenerator() {
          for (
            let i = dataTypeOffset;
            i < dataTypeOffset + dataTypeLength;
            i++
          ) {
            yield decodeData(data, typeDescription, i).value as OneResult;
          }
        };
      } else {
        generator = async function* columnGenerator() {
          const itemCount = Number(typeDescription[4]);
          const itemLength = Number(typeDescription[5]);
          for (let i = 0; i < itemCount; i++) {
            const newOffset = offset + i * itemLength;
            const typeDescriptionSlice = [...typeDescription.slice(3)];
            typeDescriptionSlice[0] &= (BigInt(1) << BigInt(63)) - BigInt(1);
            typeDescriptionSlice[1] = BigInt(newOffset);
            typeDescriptionSlice[2] = BigInt(itemLength);

            // TODO get rid of "as"
            yield decodeData(data, typeDescriptionSlice).value as OneResult;
          }
        };
      }
      return {
        type: {
          kind: 'column',
          cellType: { kind: 'anything' }, // TODO fix this
          indexedBy: 'number',
        },
        value: generator,
      };
    }

    default:
      throw new Error('Unsupported result type');
  }
};

export const deserializeResultFromRust = (val: {
  type: BigUint64Array;
  data: Uint8Array;
}): Result => {
  const typeDescription = Array.from(val.type); // TODO consider passing BigUint64Array directly
  const result = decodeData(val.data, typeDescription);
  return result;
};
