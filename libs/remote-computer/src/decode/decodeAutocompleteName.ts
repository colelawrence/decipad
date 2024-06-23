// eslint-disable-next-line no-restricted-imports
import { decodeType } from '@decipad/remote-computer-codec';
import type { AutocompleteName } from '@decipad/language-interfaces';
import type { SerializedAutocompleteName } from '../types/serializedTypes';

export const decodeAutocompleteName = (
  value: SerializedAutocompleteName
): AutocompleteName => {
  return {
    ...value,
    type: decodeType(new DataView(value.type), 0)[0],
  };
};
