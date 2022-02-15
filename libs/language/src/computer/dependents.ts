import { AST } from '..';
import { ValueLocation } from './types';
import {
  iterProgram,
  findSymbolsUsed,
  getDefinedSymbol,
  getStatement,
  getSymbolsDefinedInLocs,
} from './utils';
import { previousRefSymbols } from '../previous-ref';

const previousSymbols = Array.from(previousRefSymbols).map((s) => `var:${s}`);

export const getDependents = (
  program: AST.Block[],
  dependentsOf: ValueLocation[],
  initialSymbols = new Set<string>()
) => {
  const dependents: ValueLocation[] = [];
  const dependencySymbols = new Set([
    ...getSymbolsDefinedInLocs(program, dependentsOf),
    ...initialSymbols,
  ]);

  iterProgram(program, (stmt, loc) => {
    const usedSymbols = findSymbolsUsed(stmt);

    const isDependency =
      usedSymbols.some((sym) => dependencySymbols.has(sym)) ||
      dependencySymbols.has(getDefinedSymbol(stmt) ?? '');
    if (isDependency) {
      // Mark as dep
      dependents.push(loc);

      // Place the symbol if any in the dependency bag so its uses are identified
      const sym = getDefinedSymbol(getStatement(program, loc));
      if (sym != null) {
        dependencySymbols.add(sym);
      }
    }
    for (const s of previousSymbols) {
      dependencySymbols.add(s);
    }
  });

  return dependents;
};
