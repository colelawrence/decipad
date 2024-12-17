import type { Result, Value } from '@decipad/language-interfaces';
import { serializeType } from '../Type/serialization';
import type { Type } from '../Type/Type';
import { buildResult } from './buildResult';
import { resultToValue } from './resultToValue';

export const typedResultToValue = async (
  type: Type,
  meta: undefined | (() => Result.ResultMetadataColumn | undefined)
): Promise<(result: Result.OneResult) => Value.Value> => {
  const sType = serializeType(await type.reducedToLowest());
  return (result: Result.OneResult) =>
    resultToValue(buildResult(sType, result, meta));
};
