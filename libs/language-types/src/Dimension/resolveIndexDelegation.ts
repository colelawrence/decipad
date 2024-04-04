import type { ContextUtils } from '../ContextUtils';

export const resolveIndexDelegation = (
  utils: ContextUtils,
  _indexName: string
): string => {
  let indexName = _indexName;
  const sourceType = utils.retrieveIndexByName(indexName);
  if (
    sourceType &&
    sourceType.delegatesIndexTo &&
    sourceType.delegatesIndexTo !== indexName
  ) {
    indexName = resolveIndexDelegation(utils, sourceType.delegatesIndexTo);
  }
  return indexName;
};
