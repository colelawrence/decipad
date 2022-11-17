import { AST, getColumnLike } from '..';
import { dimSwapTypes, dimSwapValues } from '../dimtools';
import { getIdentifierString, getOfType } from '../utils';
import { Directive } from './types';

const cleanAST = (...args: AST.Node[]) =>
  [
    args[0] as AST.Expression,
    getIdentifierString(getOfType('generic-identifier', args[1])),
  ] as const;

export const over: Directive = {
  argCount: 2,
  async getType(_, { infer }, args) {
    const [matrix, indexName] = cleanAST(...args);

    return dimSwapTypes(indexName, await infer(matrix));
  },
  async getValue(_, { evaluate, getNodeType }, args) {
    const [matrix, indexName] = cleanAST(...args);

    const value = await evaluate(matrix);
    const type = await getNodeType(matrix);

    return dimSwapValues(indexName, type, getColumnLike(value));
  },
};
