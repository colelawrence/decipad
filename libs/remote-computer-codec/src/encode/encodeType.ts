import stringify from 'json-stringify-safe';
import type { SerializedType } from '@decipad/language-interfaces';
import { encodeString } from './encodeString';

export const encodeType = (
  buffer: DataView,
  offset: number,
  type: SerializedType
): number => encodeString(buffer, offset, stringify(type));
