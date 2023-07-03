import type { AST, Context } from '@decipad/language';
import { getExprRef } from '../exprRefs';
import { getDefinedSymbol } from '../utils';
import { ExprRefToVarNameMap } from '../internalTypes';

export interface VisibleVariables {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
}

export const getVisibleVariables = (
  program: AST.Block[],
  blockId: string,
  inferContext: Context,
  exprRefToVarNameMap: ExprRefToVarNameMap = new Map()
): VisibleVariables => {
  const toUserSymbol = (symbol: string | null): string | null => {
    if (!symbol) {
      return symbol;
    }
    return exprRefToVarNameMap.get(symbol) ?? symbol;
  };

  const index = program.findIndex((block) => block.id === blockId);
  if (index === -1 || program.length === 0) {
    return {
      global: new Set(),
      local: new Set(),
    };
  }

  const localSymbol = getDefinedSymbol(program[index].args[0]);
  const localSymbols = new Set([localSymbol, toUserSymbol(localSymbol)]);

  const globalVars = new Set<string>();
  const localVars = new Set<string>();

  for (const block of program) {
    const {
      id: blockId,
      args: [stat],
    } = block;

    globalVars.add(getExprRef(blockId));

    const definedSymbol = getDefinedSymbol(stat);
    for (const sym of [definedSymbol, toUserSymbol(definedSymbol)]) {
      if (sym) {
        globalVars.add(sym);

        const type = inferContext.stack.get(sym, 'global');
        if (type?.columnNames != null) {
          for (const rootSymbol of [sym, toUserSymbol(sym)]) {
            if (rootSymbol) {
              for (const col of type.columnNames) {
                // Columns are visible within a table
                if (localSymbols.has(rootSymbol)) {
                  localVars.add(col);
                }
                globalVars.add(`${rootSymbol}.${col}`);
              }
            }
          }
        }
      }
    }
  }

  return {
    global: globalVars,
    local: localVars,
  };
};
