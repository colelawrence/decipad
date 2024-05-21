import { getDefined } from '@decipad/utils';
import { type AST, type Value } from '@decipad/language-interfaces';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';

type Evaluate = (realm: TRealm, block: AST.Statement) => Promise<Value.Value>;

export const CURRENT_COLUMN_SYMBOL = Symbol('current column');

// Accumulates values into an array by consuming async iterable of values.
// Manages realm.previousValue too.
export const mapWithPrevious = async (
  realm: TRealm,
  otherColumns: Map<string, Value.ColumnLikeValue>,
  iter: () => AsyncIterable<Value.Value>
) => {
  const ret: Value.Value[] = [];

  // mapWithPrevious can be called again during iter()
  // For example with nested `given`
  const savedPreviousRow = realm.previousRow;
  realm.previousRow = undefined;

  for await (const result of iter()) {
    const previousRow = new Map<string | symbol, Value.Value>();
    await Promise.all(
      [...otherColumns.entries()].map(async ([key, value]) => {
        const v = await value.atIndex(ret.length);
        if (v != null) {
          previousRow.set(key, v);
        }
      })
    );

    ret.push(result);
    previousRow.set(CURRENT_COLUMN_SYMBOL, result);
    realm.previousRow = previousRow;
  }

  realm.previousRow = savedPreviousRow;

  return ret;
};

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
