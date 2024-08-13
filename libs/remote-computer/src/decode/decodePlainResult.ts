import { type Result } from '@decipad/language-interfaces';
import { decodeType, valueDecoder } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import type { SerializedResult } from '../types/serializedTypes';

export const decodePlainResult = async (
  result: SerializedResult
): Promise<Result.Result> => {
  const { type, value, meta } = result;
  const [decodedType] = decodeType(new DataView(type), 0);
  const [decodedValue] = await valueDecoder(decodedType)(
    new DataView(value),
    0
  );
  return {
    type: decodedType,
    value: decodedValue,
    meta: meta ? JSON.parse(new TextDecoder().decode(meta)) : undefined,
  };
};
