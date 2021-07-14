import { dequal } from 'dequal';
import { getDependents } from './dependents';
import { ValueLocation } from './types';
import {
  iterProgram,
  getDefinedSymbol,
  getSomeBlockLocations,
  getAllSymbolsDefined,
  setIntersection,
  LocationSet,
  findSymbolsUsed,
} from './utils';

export const getChangedBlocks = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) =>
  oldBlocks.flatMap((prev) => {
    const unchanged = newBlocks.some(
      (block) => block.id === prev.id && dequal(prev, block)
    );

    return unchanged ? [] : [prev.id];
  });

/**
 * Find reassigned variables, variables being used before being defined
 */
export const findSymbolErrors = (program: AST.Block[]) => {
  const reassigned = new Set<string>();
  const maybeUsedBeforeDef = new Set<string>();
  const seen = new Set<string>();

  iterProgram(program, (stmt) => {
    for (const usedSym of findSymbolsUsed(stmt)) {
      if (!seen.has(usedSym)) {
        maybeUsedBeforeDef.add(usedSym);
      }
    }

    const sym = getDefinedSymbol(stmt);
    if (sym != null) {
      if (seen.has(sym)) {
        reassigned.add(sym);
      }

      seen.add(sym);
    }
  });

  // It's only used before def, if it's actually defined
  const usedBeforeDef = setIntersection(maybeUsedBeforeDef, seen);

  return new Set([...reassigned, ...usedBeforeDef]);
};

export const findSymbolsAffectedByChange = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) => {
  const changedBlockIds = getChangedBlocks(oldBlocks, newBlocks);

  const codeWhichChanged = [...oldBlocks, ...newBlocks].filter(
    (block) =>
      changedBlockIds.includes(block.id) ||
      !oldBlocks.some((b) => b.id === block.id)
  );
  const affectedSymbols = new Set(getAllSymbolsDefined(codeWhichChanged));

  return affectedSymbols;
};

export const getStatementsToEvict = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) => {
  const changedBlockIds = getChangedBlocks(oldBlocks, newBlocks);

  const dirtyLocs = new LocationSet(
    getSomeBlockLocations(oldBlocks, changedBlockIds)
  );

  const dirtySymbols = new Set([
    ...findSymbolsAffectedByChange(oldBlocks, newBlocks),
    ...findSymbolErrors(oldBlocks),
    ...findSymbolErrors(newBlocks),
  ]);

  const dependentsOfBlocksAndSymbols = getDependents(
    oldBlocks,
    [...dirtyLocs],
    dirtySymbols
  );

  for (const dep of dependentsOfBlocksAndSymbols) {
    dirtyLocs.add(dep);
  }

  const toEvict: ValueLocation[] = [];

  iterProgram(oldBlocks, (_, loc) => {
    if (dirtyLocs.has(loc)) {
      toEvict.push(loc);
    }
  });

  return toEvict;
};
