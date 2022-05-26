import type { AST, Context } from '@decipad/language';
import { last } from '@decipad/utils';
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
  if (index === -1) {
    return {
      global: new Set(),
      local: new Set(),
    };
  }

  const statementsUntil = program
    .slice(0, index + 1)
    .flatMap((block) => block.args);

  const globalVars = new Set<string>();
  const localVars = new Set<string>();

  for (const stat of statementsUntil) {
    const sym = getDefinedSymbol(stat)?.split(':').pop();
    if (sym) {
      globalVars.add(sym);

      const type = inferContext.stack.get(sym, 'global');
      if (type?.columnNames != null) {
        for (const col of type.columnNames) {
          // Columns are visible within a table
          if (stat === last(statementsUntil)) {
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
