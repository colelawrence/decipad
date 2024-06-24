import isArrayBuffer from 'lodash/isArrayBuffer';
import stringify from 'json-stringify-safe';
import { encodeString } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import {
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_ARRAY_BUFFER,
  VALUE_TYPE_JSON,
} from './constants';
import { EncodeToBufferOptions } from './types';
import { debug } from './debug';

export const encodingToBuffer = (options: EncodeToBufferOptions) => {
  const rootValueKeys = new Set(options.rootValueKeys);
  const innerEncodeToBuffer = async (
    value: object,
    buffer: ArrayBuffer,
    dataView: Value.GrowableDataView,
    _offset = 0,
    _keyCount = 0,
    prefix = ''
  ): Promise<[number, number]> => {
    let offset = _offset;
    let keyCount = _keyCount;
    for (const [key, keyValue] of Object.entries(value)) {
      const composedKey = prefix ? `${prefix}.${key}` : key;
      if (!options.rootValueKeys.some((k) => k.startsWith(composedKey))) {
        continue;
      }
      if (isArrayBuffer(keyValue)) {
        keyCount += 1;
        offset = encodeString(dataView, offset, composedKey);
        dataView.setUint8(offset, VALUE_TYPE_ARRAY_BUFFER);
        offset += 1;
        dataView.setUint32(offset, keyValue.byteLength);
        offset += 4;
        dataView.ensureCapacity(offset + keyValue.byteLength);
        new Uint8Array(buffer).set(new Uint8Array(keyValue), offset);
        offset += keyValue.byteLength;
      } else if (rootValueKeys.has(composedKey)) {
        keyCount += 1;
        offset = encodeString(dataView, offset, composedKey);
        if (Array.isArray(keyValue)) {
          dataView.setUint8(offset, VALUE_TYPE_ARRAY);
          offset += 1;
          dataView.setUint32(offset, keyValue.length);
          offset += 4;
          for (const item of keyValue) {
            if (isArrayBuffer(item)) {
              dataView.setUint8(offset, VALUE_TYPE_ARRAY_BUFFER);
              offset += 1;
              dataView.setUint32(offset, item.byteLength);
              offset += 4;
              dataView.ensureCapacity(offset + item.byteLength);
              new Uint8Array(buffer).set(new Uint8Array(item), offset);
              offset += item.byteLength;
            } else {
              dataView.setUint8(offset, VALUE_TYPE_JSON);
              offset += 1;
              const encodedValue = stringify(item);
              offset = encodeString(dataView, offset, encodedValue);
            }
          }
        } else {
          dataView.setUint8(offset, VALUE_TYPE_JSON);
          offset += 1;
          const encodedValue = stringify(keyValue);
          offset = encodeString(dataView, offset, encodedValue);
        }
      } else if (keyValue != null && typeof keyValue === 'object') {
        // eslint-disable-next-line no-await-in-loop
        const [newOffset, newKeyCount] = await innerEncodeToBuffer(
          keyValue,
          buffer,
          dataView,
          offset,
          keyCount,
          composedKey
        );
        offset = newOffset;
        keyCount = newKeyCount;
      }
    }
    return [offset, keyCount];
  };

  return async (
    value: object,
    buffer: ArrayBuffer,
    dataView: Value.GrowableDataView,
    initialOffset = 0
  ) => {
    let offset = initialOffset;
    offset += 2; // Skip the length
    const [length, keyCount] = await innerEncodeToBuffer(
      value,
      buffer,
      dataView,
      offset
    );
    debug('encode: key count', keyCount);
    dataView.setUint16(initialOffset, keyCount);
    return length;
  };
};
