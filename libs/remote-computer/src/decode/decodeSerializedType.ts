import type {
  SerializedType,
  SerializedTypes,
} from '@decipad/language-interfaces';
import type { SerializedSerializedType } from '../types/serializedTypes';
import { decodeUnit } from './decodeUnit';
import { decodeErrorSpec } from './decodeErrorSpec';
import { decodeType } from './decodeType';

export const decodeSerializedType = (
  type: SerializedSerializedType
): SerializedType => {
  if (type.kind === 'number') {
    return {
      ...type,
      unit: type.unit ? type.unit.map(decodeUnit) : type.unit,
    } as SerializedType;
  }
  if (type.kind === 'type-error') {
    return {
      ...type,
      errorCause: decodeErrorSpec(decodeType)(
        (type as SerializedTypes.TypeError).errorCause
      ),
    } as SerializedType;
  }
  return type as SerializedType;
};
