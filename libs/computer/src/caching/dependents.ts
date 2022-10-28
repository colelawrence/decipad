import { previousRefSymbols } from '@decipad/language';
import { AST } from '..';
import {
  iterProgram,
  findSymbolsUsed,
  getDefinedSymbol,
  getStatement,
  getSymbolsDefinedInBlocks,
} from '../utils';

export const getDependents = (
  program: AST.Block[],
  dependentsOf: string[],
  initialSymbols = new Set<string>()
) => {
  const dependents: string[] = [];
  const dependencySymbols = new Set([
    ...getSymbolsDefinedInBlocks(program, dependentsOf),
    ...initialSymbols,
  ]);

  iterProgram(program, (stmt, blockId) => {
    const usedSymbols = findSymbolsUsed(stmt);

    const isDependency =
      usedSymbols.some((sym) => dependencySymbols.has(sym)) ||
      dependencySymbols.has(getDefinedSymbol(stmt) ?? '');
    if (isDependency) {
      // Mark as dep
      dependents.push(blockId);

      // Place the symbol if any in the dependency bag so its uses are identified
      const sym = getDefinedSymbol(getStatement(program, blockId));
      if (sym != null) {
        dependencySymbols.add(sym);
      }
    }
    for (const s of previousRefSymbols) {
      dependencySymbols.add(s);
    }
  });

  return dependents;
};
