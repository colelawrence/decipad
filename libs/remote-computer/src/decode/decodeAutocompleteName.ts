// eslint-disable-next-line no-restricted-imports
import { decodeType } from '@decipad/remote-computer-codec';
import type { AutocompleteNameWithSerializedType } from '@decipad/language-interfaces';
import type { SerializedAutocompleteName } from '../types/serializedTypes';

export const decodeAutocompleteName = (
  value: SerializedAutocompleteName
): AutocompleteNameWithSerializedType => {
  const serializedType = decodeType(new DataView(value.serializedType), 0)[0];
  return {
    ...value,
    kind: serializedType.kind,
    serializedType,
  };
};
