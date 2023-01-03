import { AST } from '@decipad/computer';
import { IdentifiedBlock } from 'libs/computer/src/types';

export function statementToIdentifiedBlock(
  id: string,
  stat: AST.Statement,
  definesVariable?: string,
  definesTableColumn?: string
): IdentifiedBlock {
  const defs =
    definesTableColumn && definesVariable
      ? {
          definesTableColumn: [definesVariable, definesTableColumn] as [
            string,
            string
          ],
        }
      : definesVariable
      ? { definesVariable }
      : {};

  return {
    type: 'identified-block',
    id,
    block: {
      id,
      type: 'block',
      args: [stat],
    },
    ...defs,
  };
}
