import type { SerializedType } from '@decipad/language-interfaces';
import type { SerializedSerializedType } from '../types/serializedTypes';
import { encodeUnit } from './encodeUnit';
import { encodeErrorSpec } from './encodeErrorSpec';
import { encodeType } from './encodeType';

export const encodeSerializedType = (
  type: SerializedType
): SerializedSerializedType => {
  if (type.kind === 'number') {
    return {
      ...type,
      unit: type.unit?.map(encodeUnit),
    } as SerializedSerializedType;
  }
  if (type.kind === 'type-error') {
    return {
      ...type,
      errorCause: encodeErrorSpec(encodeType)(type.errorCause),
    } as SerializedSerializedType;
  }
  return type as SerializedSerializedType;
};
