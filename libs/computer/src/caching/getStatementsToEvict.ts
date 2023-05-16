import { AST, ExternalDataMap } from '@decipad/language';
import { dequal } from 'dequal';
import { getDependents } from './dependents';
import {
  findSymbolsUsed,
  getAllSymbolsDefined,
  getDefinedSymbol,
  getExistingBlockIds,
  iterProgram,
  setIntersection,
} from '../utils';
import { areBlocksEqual } from './areBlocksEqual';

const getChangedMapKeys = <T>(
  oldMap: Map<string, T>,
  newMap: Map<string, T>,
  equals: (a: T | undefined, b: T | undefined) => boolean
): string[] => {
  const allKeys = new Set(
    Array.from(oldMap.keys()).concat(Array.from(newMap.keys()))
  );

  return Array.from(allKeys).filter((key) => {
    const oldVal = oldMap.get(key);
    const newVal = newMap.get(key);

    return !equals(oldVal, newVal);
  });
};

const mapify = (blocks: AST.Block[]) => new Map(blocks.map((b) => [b.id, b]));
export const getChangedBlocks = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) =>
  new Set(
    getChangedMapKeys(mapify(oldBlocks), mapify(newBlocks), areBlocksEqual)
  );

/**
 * Find reassigned variables, variables being used before being defined
 */
export const findSymbolErrors = (program: AST.Block[]) => {
  const reassigned = new Set<string>();
  const maybeUsedBeforeDef = new Set<string>();
  const seenDefinitions = new Set<string>();

  iterProgram(program, (stmt) => {
    const sym = getDefinedSymbol(stmt, true);

    for (const usedSym of findSymbolsUsed(stmt)) {
      if (sym === usedSym) continue;

      if (!seenDefinitions.has(usedSym)) {
        maybeUsedBeforeDef.add(usedSym);
      }
    }

    if (sym != null) {
      if (seenDefinitions.has(sym)) {
        reassigned.add(sym);
      }

      seenDefinitions.add(sym);
    }
  });

  // It's only used before def, if it's actually defined
  const usedBeforeDef = setIntersection(maybeUsedBeforeDef, seenDefinitions);

  return new Set([...reassigned, ...usedBeforeDef]);
};

export const findSymbolsAffectedByChange = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) => {
  const changedBlockIds = getChangedBlocks(oldBlocks, newBlocks);

  const codeWhichChanged = Array.from(oldBlocks)
    .concat(Array.from(newBlocks))
    .filter(
      (block) =>
        changedBlockIds.has(block.id) ||
        !oldBlocks.some((b) => b.id === block.id)
    );
  const affectedSymbols = new Set(getAllSymbolsDefined(codeWhichChanged));

  return affectedSymbols;
};

export interface GetStatementsToEvictArgs {
  oldBlocks: AST.Block[];
  newBlocks: AST.Block[];
  oldExternalData?: ExternalDataMap;
  newExternalData?: ExternalDataMap;
}

export const getStatementsToEvict = ({
  oldBlocks,
  newBlocks,
  oldExternalData = new Map(),
  newExternalData = new Map(),
}: GetStatementsToEvictArgs) => {
  const changedBlockIds = getChangedBlocks(oldBlocks, newBlocks);

  const dirtyLocs = new Set(getExistingBlockIds(oldBlocks, changedBlockIds));

  const dirtySymbols = new Set([
    ...getChangedMapKeys(oldExternalData, newExternalData, dequal),
    ...findSymbolsAffectedByChange(oldBlocks, newBlocks),
    ...findSymbolErrors(oldBlocks),
    ...findSymbolErrors(newBlocks),
  ]);

  const dependentsOfBlocksAndSymbols = getDependents(
    oldBlocks,
    Array.from(dirtyLocs),
    dirtySymbols
  );

  for (const dep of dependentsOfBlocksAndSymbols) {
    dirtyLocs.add(dep);
  }

  const toEvict = oldBlocks.flatMap((b) => (dirtyLocs.has(b.id) ? b.id : []));

  return toEvict;
};
