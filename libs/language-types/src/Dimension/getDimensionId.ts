import { Type } from '../Type';
import { ContextUtils } from '../ContextUtils';
import { resolveIndexDelegation } from './resolveIndexDelegation';

export const getDimensionId = (
  utils: ContextUtils,
  type: Type,
  index: number
) => {
  let source = type.indexedBy;
  if (source) {
    source = resolveIndexDelegation(utils, source);
  }
  return source ?? index;
};
