export { replaceExprRefsWithPrettyRefs as makeNamesFromIds } from './makeNamesFromIds';

export const getExprRef = (blockId: string): string => {
  // simplify the block ID to a valid identifier
  return `exprRef_${blockId.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

export const isExprRef = (varName: string) => varName.startsWith('exprRef_');

export const assertIsExprRef = (varName: string): string => {
  /* istanbul ignore next */
  if (!isExprRef(varName)) {
    throw new Error('expected expression ref');
  }
  return varName;
};
