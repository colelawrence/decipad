import { type AST } from '@decipad/language-interfaces';
import { type ReadOnlyVarNameToBlockMap } from '../internalTypes';
import { getIdentifierString } from '../utils';
import { getExprRef } from './exprRef';

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
