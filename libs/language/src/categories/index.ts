// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { InferError, Value, buildType as t } from '@decipad/language-types';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
import { inferExpression } from '../infer';
import { evaluate } from '../interpreter';
import { getIdentifierString } from '../utils';
import type { TRealm } from '../scopedRealm';

export const inferCategories = async (
  realm: TRealm,
  category: AST.Categories
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  if (realm.depth !== 0) {
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

  ctx.stack.set(name, theSet, realm.statementId);
  return theSet;
};

export const evaluateCategories = async (
  realm: TRealm,
  category: AST.Categories
): Promise<ValueTypes.ColumnLikeValue> => {
  const [nameExp, contentsExp] = category.args;

  const name = getIdentifierString(nameExp);
  const contents = await evaluate(realm, contentsExp);

  const theSet = Value.getColumnLike(contents);

  realm.stack.set(name, theSet, realm.statementId);
  return theSet;
};
