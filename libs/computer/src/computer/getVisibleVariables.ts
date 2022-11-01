import type { AST, Context } from '@decipad/language';
import { getExprRef } from '../exprRefs';
import { getDefinedSymbol } from '../utils';

export interface VisibleVariables {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
}

export const getVisibleVariables = (
  program: AST.Block[],
  blockId: string,
  inferContext: Context
): VisibleVariables => {
  const index = program.findIndex((block) => block.id === blockId);
  if (index === -1 || program.length === 0) {
    return {
      global: new Set(),
      local: new Set(),
    };
  }

  const blocksUntil = program.slice(0, index + 1);
  const localSymbol = getDefinedSymbol(program[index].args[0]);

  const globalVars = new Set<string>();
  const localVars = new Set<string>();

  for (const block of blocksUntil) {
    const {
      id: blockId,
      args: [stat],
    } = block;

    globalVars.add(getExprRef(blockId));

    const sym = getDefinedSymbol(stat);
    if (sym) {
      globalVars.add(sym);

      const type = inferContext.stack.get(sym, 'global');
      if (type?.columnNames != null) {
        for (const col of type.columnNames) {
          // Columns are visible within a table
          if (sym === localSymbol) {
            localVars.add(col);
          }
          globalVars.add(`${sym}.${col}`);
        }
      }
    }
  }

  return {
    global: globalVars,
    local: localVars,
  };
};
