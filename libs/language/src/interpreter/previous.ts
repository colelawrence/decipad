import { getDefined } from '@decipad/utils';
import { type AST, type Value } from '@decipad/language-interfaces';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';

type Evaluate = (realm: TRealm, block: AST.Statement) => Promise<Value.Value>;

export const CURRENT_COLUMN_SYMBOL = Symbol('current column');

export const usingPrevious = async (
  realm: TRealm,
  expression: AST.Expression,
  evaluate: Evaluate
): Promise<Value.Value> => {
  const previousRow = getDefined(realm.previousRow, 'no previous row');
  return withPush(
    realm,
    async (newRealm) => {
      for (const [columnName, columnValue] of previousRow) {
        if (typeof columnName === 'string') {
          newRealm.stack.set(columnName, columnValue);
        }
      }
      return evaluate(newRealm, expression);
    },
    `usingPrevious(${prettyPrintAST(expression)})`
  );
};
