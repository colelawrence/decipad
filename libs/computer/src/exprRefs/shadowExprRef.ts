import { getExprRef } from './exprRef';

export const shadowExprRef = (blockId: string): string =>
  `${getExprRef(blockId)}_shadow`;
