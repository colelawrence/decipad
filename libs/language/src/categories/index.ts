// eslint-disable-next-line no-restricted-imports
import {
  AST,
  InferError,
  Type,
  Value,
  buildType as t,
} from '@decipad/language-types';
import { inferExpression } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { getIdentifierString } from '../utils';

export const inferCategories = async (
  realm: Realm,
  category: AST.Categories
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('category'));
  }

  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await inferExpression(realm, contentsExp);

  const theSet = await (
    await (await (await contents.isColumn()).reduced()).isPrimitive()
  ).mapType(async (setCell: Type) => {
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
): Promise<Value.ColumnLikeValue> => {
  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await evaluate(realm, contentsExp);

  const theSet = Value.getColumnLike(contents);

  realm.stack.set(name, theSet, 'function', realm.statementId);
  return theSet;
};
