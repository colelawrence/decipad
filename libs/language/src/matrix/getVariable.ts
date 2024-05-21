// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  buildType as t,
  Value,
  RuntimeError,
} from '@decipad/language-types';
import { getIdentifierString } from '../utils';
import type { TRealm, TScopedInferContext } from '../scopedRealm';
import type { AST } from '@decipad/language-interfaces';

export const getIndexName = (type: Type) =>
  type.indexedBy ?? type.indexName ?? null;

export const inferVariable = async (
  context: TScopedInferContext,
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

export const evaluateVariable = (realm: TRealm, varName: RefLike) => {
  const variable = realm.stack.get(refName(varName));

  if (!variable) {
    throw new RuntimeError(InferError.missingVariable(refName(varName)));
  } else if (!Value.isColumnLike(variable)) {
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
