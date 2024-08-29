import type { AutocompleteNameWithSerializedType } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodeType } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedAutocompleteName } from '../types/serializedTypes';

export const encodeAutocompleteName = (
  value: AutocompleteNameWithSerializedType
): SerializedAutocompleteName => {
  const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
  const typeLength = encodeType(buffer, 0, value.serializedType);
  return {
    ...value,
    serializedType: buffer.seal(typeLength),
  };
};
