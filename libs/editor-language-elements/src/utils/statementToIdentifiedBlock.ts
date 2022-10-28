import { AST } from '@decipad/computer';
import { IdentifiedBlock } from 'libs/computer/src/types';

export function statementToIdentifiedBlock(
  id: string,
  stat: AST.Statement
): IdentifiedBlock {
  return {
    type: 'identified-block',
    id,
    block: {
      id,
      type: 'block',
      args: [stat],
    },
  };
}
