import { AST, Context } from '..';
import { inferExpression } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { ColumnLike, getColumnLike } from '../value';
import { buildType as t, InferError, Type } from '../type';
import { getIdentifierString } from '../utils';

export const inferCategories = (
  ctx: Context,
  category: AST.Categories
): Type => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('category'));
  }

  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = inferExpression(ctx, contentsExp);

  const theSet = contents
    .isColumn()
    .reduced()
    .isPrimitive()
    .mapType((setCell) => {
      if (ctx.stack.has(name)) {
        return t.impossible(InferError.duplicatedName(name));
      }
      return t.column(setCell, name);
    });

  ctx.stack.set(name, theSet, 'function', ctx.statementId);
  return theSet;
};

export const evaluateCategories = async (
  realm: Realm,
  category: AST.Categories
): Promise<ColumnLike> => {
  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await evaluate(realm, contentsExp);

  const theSet = getColumnLike(contents);

  realm.stack.set(name, theSet, 'function', realm.statementId);
  return theSet;
};
