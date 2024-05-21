// eslint-disable-next-line no-restricted-imports
import { hydrateType } from '@decipad/language-types';
import type { SerializedType } from '@decipad/language-interfaces';
import { decodeString } from './decodeString';

export const decodeType = (
  buffer: DataView,
  _offset: number
): [SerializedType, number] => {
  let offset = _offset;
  let typeAsString: string;
  // eslint-disable-next-line prefer-const
  [typeAsString, offset] = decodeString(buffer, offset);
  try {
    return [hydrateType(JSON.parse(typeAsString) as SerializedType), offset];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error while parsing type: "%s"', typeAsString);
    throw err;
  }
};
