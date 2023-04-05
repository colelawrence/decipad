import { AST } from '@decipad/computer';
import { IdentifiedBlock } from 'libs/computer/src/types';
import {
  getDefinedSymbol,
  getIdentifierString,
} from '../../../computer/src/utils';

export function statementToIdentifiedBlock(
  id: string,
  stat: AST.Statement
): IdentifiedBlock {
  const varName = getDefinedSymbol(stat, true);
  let defs: Partial<IdentifiedBlock> = {};

  if (stat?.type === 'table-column-assign' && varName != null) {
    const [, col] = stat.args;
    defs = { definesTableColumn: [varName, getIdentifierString(col)] };
  } else if (varName != null) {
    defs = { definesVariable: varName };
  }

  return {
    type: 'identified-block',
    id,
    block: { id, type: 'block', args: [stat] },
    ...defs,
  };
}
