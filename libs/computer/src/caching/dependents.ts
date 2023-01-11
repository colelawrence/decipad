import { previousRefSymbols } from '@decipad/language';
import { getDefined } from '@decipad/utils';
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
  initialSymbols = new Set<string>(),
  secondPass = false
): string[] => {
  const dependents: string[] = [];
  const dependencySymbols = new Set([
    ...getSymbolsDefinedInBlocks(program, dependentsOf),
    ...initialSymbols,
  ]);

  iterProgram(program, (stmt, blockId) => {
    const usedSymbols = findSymbolsUsed(stmt);

    const isDependent =
      usedSymbols.some((sym) => dependencySymbols.has(sym)) ||
      dependencySymbols.has(getDefinedSymbol(stmt) ?? '');
    if (isDependent) {
      // Mark as dependent
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

  // Perform a second pass, wherein we know what tables are dependents and check *their* dependencies.
  // This is because today, tables must be evaluated wholesale.
  if (!secondPass) {
    const tableNames = getTablesInBlockIds(program, dependents);
    const checkSymbols = new Set([...tableNames, ...dependencySymbols]);
    return getDependents(program, dependents, checkSymbols, true);
  }

  return dependents;
};

function getTablesInBlockIds(program: AST.Block[], blockIdsToCheck: string[]) {
  const tables = new Set<string>();
  for (const blockId of blockIdsToCheck) {
    const stmt = getStatement(program, blockId);
    if (stmt.type === 'table' || stmt.type === 'table-column-assign') {
      tables.add(getDefined(getDefinedSymbol(stmt)));
    }
  }
  return tables;
}
