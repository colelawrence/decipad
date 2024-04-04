// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { inferExpression } from '..';
import { dimSwapTypes, dimSwapValues } from '../dimtools';
import { evaluate } from '../interpreter';
import { getIdentifierString } from '../utils';
import type { DirectiveImpl } from './types';

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
      Value.getColumnLike(value)
    );
  },
};
