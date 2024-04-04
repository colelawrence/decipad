// eslint-disable-next-line no-restricted-imports
import type { ErrSpec, SerializedType } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';

export function getErrSpec(
  type: Type | SerializedType | null | undefined
): ErrSpec | undefined {
  if (type == null) {
    return undefined;
  } else if (type instanceof Type) {
    return type.errorCause?.spec;
  } else if (type.kind === 'type-error') {
    return type.errorCause;
  } else {
    return undefined;
  }
}
