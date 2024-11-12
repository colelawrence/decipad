import { AnyResult } from 'libs/language-interfaces/src/Result';
import { deserializeResult, serializeResult } from '.';

const ENCODING_V1 = 1;

const ENCODING_VERSION_LENGTH = 4;
const TYPE_ARRAY_LENGTH = 4;

const UINT32_LENGTH = 4;
const UINT8_LENGTH = 1;

const BIGUINT64_LENGTH = 8;

/**
 * Binary format (bytes): [Encoding Version = 4 bytes, Type Array Length = 4 bytes, Type, Data];
 */
export const encodeResultToBuffer = async (
  result: AnyResult
): Promise<Uint8Array> => {
  const { type, data } = await serializeResult(result);

  const typeArray = new Uint8Array(type.buffer);

  const bufferLength =
    ENCODING_VERSION_LENGTH +
    TYPE_ARRAY_LENGTH +
    typeArray.byteLength +
    data.byteLength;

  const fullyEncodedResult = new Uint8Array(bufferLength);
  const dataView = new DataView(fullyEncodedResult.buffer);

  let offset = 0;

  dataView.setUint32(offset, ENCODING_V1);
  offset += UINT32_LENGTH;

  dataView.setUint32(offset, typeArray.byteLength);
  offset += UINT32_LENGTH;

  for (const byte of typeArray) {
    dataView.setUint8(offset, byte);
    offset += UINT8_LENGTH;
  }

  for (const byte of data) {
    dataView.setUint8(offset, byte);
    offset += UINT8_LENGTH;
  }

  return fullyEncodedResult;
};

export const decodeResultBuffer = async (
  buffer: Uint8Array
): Promise<AnyResult> => {
  const dataView = new DataView(buffer.buffer);

  let offset = 0;

  const encodingVersion = dataView.getUint32(offset);
  offset += UINT32_LENGTH;

  if (encodingVersion !== ENCODING_V1) {
    throw new Error('Should always be version 1 to start with.');
  }

  const byteTypeArrayLength = dataView.getUint32(offset);
  offset += UINT32_LENGTH;

  const typeArrayLength = byteTypeArrayLength / BIGUINT64_LENGTH;
  const typeArray = new BigUint64Array(typeArrayLength);

  for (let i = 0; i < typeArrayLength; i++) {
    typeArray[i] = dataView.getBigUint64(offset, true);
    offset += BIGUINT64_LENGTH;
  }

  const data = buffer.slice(offset);

  return deserializeResult({ type: typeArray, data });
};
