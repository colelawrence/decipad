import { getDefined } from '@decipad/utils';
import { AST, Context } from '..';
import { inferExpression } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { ColumnLike, getColumnLike } from '../value';
import { build as t, InferError, Type } from '../type';
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

  const theSet = contents
    .isColumn()
    .reduced()
    .isPrimitive()
    .mapType((setCell) => {
      if (ctx.stack.has(name)) {
        return t.impossible(InferError.duplicatedName(name));
      }
      return t.column(setCell, getDefined(contents.columnSize), name);
    });

  ctx.stack.set(name, theSet);
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

  realm.stack.set(name, theSet);
  return theSet;
};
