import type { AST, Context } from '@decipad/language';
import { getDefinedSymbol } from '../utils';

export const getVisibleVariables = (
  program: AST.Block[],
  blockId: string,
  inferContext: Context
): ReadonlySet<string> => {
  const index = program.findIndex((block) => block.id === blockId);
  if (index === -1) {
    return new Set();
  }

  const statementsUntil = program
    .slice(0, index + 1)
    .flatMap((block) => block.args);

  const vars = new Set<string>();

  for (const stat of statementsUntil) {
    const sym = getDefinedSymbol(stat)?.split(':').pop();
    if (sym) {
      vars.add(sym);

      const type = inferContext.stack.get(sym);
      if (type?.columnNames != null) {
        for (const col of type.columnNames) {
          // Columns are visible within a table
          vars.add(col);
          vars.add(`${sym}.${col}`);
        }
      }
    }
  }

  return vars;
};
