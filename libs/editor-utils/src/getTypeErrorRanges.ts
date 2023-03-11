import { DECORATE_TYPE_ERROR } from '@decipad/editor-types';
import type { SerializedTypes } from '@decipad/computer';
import { Path } from 'slate';
import { formatError } from '@decipad/format';
import { TypeErrorAnnotation } from './TypeErrorAnnotation';

interface ErrorType {
  errorLocation?: SerializedTypes.TypeError['errorLocation'];
  errorCause: SerializedTypes.TypeError['errorCause'];
}

export function getTypeErrorRanges(
  path: Path,
  error?: ErrorType
): TypeErrorAnnotation[] {
  if (
    !error?.errorLocation ||
    !error?.errorLocation.end ||
    !error?.errorLocation.start
  ) {
    return [];
  }

  return [
    {
      [DECORATE_TYPE_ERROR]: true,
      anchor: { path, offset: error.errorLocation.start.char },
      focus: { path, offset: error.errorLocation.end.char + 1 },
      error: formatError('en-US', error.errorCause),
    },
  ];
}
