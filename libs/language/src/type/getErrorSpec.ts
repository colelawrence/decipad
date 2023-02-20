import { Type } from './Type';
import type { ErrSpec } from './InferError';
import type { SerializedType } from './SerializedType';

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
