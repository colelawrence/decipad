import type { Value } from '../Value';
import { serializeType } from '../Type/serialization';
import type { OneResult } from '../Result';
import type { Type } from '../Type/Type';
import { buildResult } from './buildResult';
import { resultToValue } from './resultToValue';

export const typedResultToValue = async (
  type: Type
): Promise<(result: OneResult) => Value> => {
  const sType = serializeType(await type.reducedToLowest());
  return (result: OneResult) => resultToValue(buildResult(sType, result));
};
