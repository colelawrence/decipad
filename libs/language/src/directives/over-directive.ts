import { AST, getColumnLike, inferExpression } from '..';
import { dimSwapTypes, dimSwapValues } from '../dimtools';
import { evaluate } from '../interpreter';
import { getIdentifierString } from '../utils';
import { DirectiveImpl } from './types';

export const over: DirectiveImpl<AST.OverDirective> = {
  async getType(ctx, overExp) {
    const [, matrix, indexName] = overExp.args;

    return dimSwapTypes(
      getIdentifierString(indexName),
      await inferExpression(ctx, matrix)
    );
  },
  async getValue(realm, overExp) {
    const [, matrix, indexName] = overExp.args;

    const value = await evaluate(realm, matrix);
    const type = realm.getTypeAt(matrix);

    return dimSwapValues(
      getIdentifierString(indexName),
      type,
      getColumnLike(value)
    );
  },
};
