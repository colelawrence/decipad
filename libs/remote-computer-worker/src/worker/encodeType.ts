import stringify from 'json-stringify-safe';
// eslint-disable-next-line no-restricted-imports
import type { SerializedType } from '@decipad/language-types';
import { encodeString } from './encodeString';

export const encodeType = (
  buffer: DataView,
  offset: number,
  type: SerializedType
): number => encodeString(buffer, offset, stringify(type));
