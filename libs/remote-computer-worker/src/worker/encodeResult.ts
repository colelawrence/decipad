// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import { encodeType } from './encodeType';
import type { RecursiveEncoder } from './types';

const undefinedResult: Result.Result = {
  type: { kind: 'nothing' },
  value: Unknown,
};

export const encodeResult = async (
  buffer: DataView,
  _offset: number,
  result: Result.Result,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
): Promise<number> => {
  if (result.value === undefined) {
    return encodeResult(buffer, _offset, undefinedResult, encoders);
  }

  let offset = _offset;
  offset = encodeType(buffer, offset, result.type);

  return encoders[result.type.kind](
    result.type,
    buffer,
    result.value ?? Unknown,
    offset,
    encoders
  );
};
