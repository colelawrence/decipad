import { decodeString } from '@decipad/remote-computer-codec';
import {
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_ARRAY_BUFFER,
  VALUE_TYPE_JSON,
} from './constants';
import { debug } from './debug';

const pushKey = <TTarget extends object>(
  target: TTarget,
  keyParts: string[],
  value: unknown
) => {
  const key = keyParts[0] as keyof TTarget;
  if (keyParts.length === 1) {
    // eslint-disable-next-line no-param-reassign
    target[key] = value as never;
    return;
  }
  if (!target[key]) {
    // eslint-disable-next-line no-param-reassign
    target[key] = {} as never;
  }
  pushKey(target[key] as object, keyParts.slice(1), value);
};

export const decodeFromBuffer = async <T extends object>(
  dataView: DataView,
  _offset = 0
): Promise<T> => {
  let offset = _offset;
  const keyCount = dataView.getUint16(offset);
  debug('decode: key count', keyCount);
  offset += 2;
  const entries: Record<string, unknown> = {};
  for (let keyIndex = 0; keyIndex < keyCount; keyIndex += 1) {
    const [key, newOffset] = decodeString(dataView, offset);
    offset = newOffset;
    const valueType = dataView.getUint8(offset);
    offset += 1;
    let value: unknown | undefined;
    switch (valueType) {
      case VALUE_TYPE_ARRAY_BUFFER: {
        const length = dataView.getUint32(offset);
        offset += 4;
        value = dataView.buffer.slice(offset, offset + length);
        offset += length;
        break;
      }
      case VALUE_TYPE_JSON: {
        const [resultString, newOffset2] = decodeString(dataView, offset);
        offset = newOffset2;
        value = JSON.parse(resultString);
        break;
      }
      case VALUE_TYPE_ARRAY: {
        const length = dataView.getUint32(offset);
        offset += 4;
        value = new Array(length);
        for (let index = 0; index < length; index += 1) {
          const subValueType = dataView.getUint8(offset);
          offset += 1;
          let subValue;
          if (subValueType === VALUE_TYPE_ARRAY_BUFFER) {
            const length2 = dataView.getUint32(offset);
            offset += 4;
            subValue = dataView.buffer.slice(offset, offset + length2);
            offset += length2;
          } else if (subValueType === VALUE_TYPE_JSON) {
            const [resultString, newOffset2] = decodeString(dataView, offset);
            offset = newOffset2;
            subValue = JSON.parse(resultString);
          }
          (value as Array<unknown>)[index] = subValue;
        }
        break;
      }
      default: {
        throw new TypeError(`Unknown value type ${valueType}`);
      }
    }
    if (value != null) {
      pushKey(entries, key.split('.'), value);
    }
  }
  return entries as T;
};
