import { AST, Context } from '..';
import { inferExpression } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { ColumnLikeValue, getColumnLike } from '../value';
import { buildType as t, InferError, Type } from '../type';
import { getIdentifierString } from '../utils';

export const inferCategories = async (
  ctx: Context,
  category: AST.Categories
): Promise<Type> => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('category'));
  }

  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await inferExpression(ctx, contentsExp);

  const theSet = await (
    await (await (await contents.isColumn()).reduced()).isPrimitive()
  ).mapType(async (setCell) => {
    if (ctx.stack.has(name)) {
      return t.impossible(InferError.duplicatedName(name));
    }
    return t.column(await setCell, name);
  });

  ctx.stack.set(name, theSet, 'function', ctx.statementId);
  return theSet;
};

export const evaluateCategories = async (
  realm: Realm,
  category: AST.Categories
): Promise<ColumnLikeValue> => {
  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await evaluate(realm, contentsExp);

  const theSet = getColumnLike(contents);

  realm.stack.set(name, theSet, 'function', realm.statementId);
  return theSet;
};
