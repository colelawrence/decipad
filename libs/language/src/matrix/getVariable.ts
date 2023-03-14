import { AST, Context } from '..';
import { Realm, RuntimeError } from '../interpreter';
import { isColumnLike } from '../value';
import { buildType as t, Type, InferError } from '../type';
import { getIdentifierString } from '../utils';

export const getIndexName = (type: Type) =>
  type.indexedBy ?? type.indexName ?? null;

export const inferVariable = (
  context: Context,
  varName: RefLike,
  expectedDim?: string | null
) => {
  const variable = context.stack.get(refName(varName));

  if (!variable) {
    return t.impossible(InferError.missingVariable(refName(varName)));
  } else if (expectedDim && getIndexName(variable) !== expectedDim) {
    const expectedTable = expectedDim
      ? context.stack.get(expectedDim)
      : undefined;
    return t.impossible(
      InferError.expectedTableAndAssociatedColumn(expectedTable, variable)
    );
  } else {
    return variable.isColumn();
  }
};

export const evaluateVariable = (realm: Realm, varName: RefLike) => {
  const variable = realm.stack.get(refName(varName));

  if (!variable) {
    throw new RuntimeError(InferError.missingVariable(refName(varName)));
  } else if (!isColumnLike(variable)) {
    throw new RuntimeError('Expected column');
  } else {
    return variable;
  }
};

type RefLike = AST.Ref | AST.Def | string;
const refName = (refLike: RefLike) => {
  if (typeof refLike === 'string') {
    return refLike;
  } else {
    return getIdentifierString(refLike);
  }
};
