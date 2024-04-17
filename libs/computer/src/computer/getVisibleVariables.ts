// eslint-disable-next-line no-restricted-imports
import type { TScopedInferContext } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { getExprRef } from '../exprRefs';
import { getDefinedSymbol, getGoodBlocks } from '../utils';
import type { ExprRefToVarNameMap } from '../internalTypes';
import type { ComputerProgram } from '../types';

export interface VisibleVariables {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
}

export const getVisibleVariables = (
  _program: ComputerProgram,
  blockId: string,
  inferContext: TScopedInferContext,
  exprRefToVarNameMap: ExprRefToVarNameMap = new Map()
): VisibleVariables => {
  const program = getGoodBlocks(_program.asSequence);
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

  const localSymbol = getDefinedSymbol(
    getDefined(program[index].block).args[0]
  );
  const localSymbols = new Set([localSymbol, toUserSymbol(localSymbol)]);

  const globalVars = new Set<string>();
  const localVars = new Set<string>();

  for (const block of program) {
    const {
      id: blockId,
      block: {
        args: [stat],
      },
    } = block;

    globalVars.add(getExprRef(blockId));

    const definedSymbol = getDefinedSymbol(stat);
    for (const sym of [definedSymbol, toUserSymbol(definedSymbol)]) {
      if (sym) {
        globalVars.add(sym);

        const type = inferContext.stack.get(sym);
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
