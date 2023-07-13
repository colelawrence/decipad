import { type ReadOnlyVarNameToBlockMap } from '../internalTypes';
import { type AST, getExprRef } from '..';
import { getIdentifierString } from '../utils';

export const maybeReplaceIdentifierWith =
  (varNameToBlockMap: ReadOnlyVarNameToBlockMap) =>
  (identifier: AST.Identifier): string | false => {
    const name = getIdentifierString(identifier);
    const block = varNameToBlockMap.get(name);
    if (block) {
      const exprRef = getExprRef(block.id);
      const previous = identifier.args[0];
      if (previous !== exprRef) {
        identifier.args[0] = exprRef;
        return previous;
      }
    }
    return false;
  };
