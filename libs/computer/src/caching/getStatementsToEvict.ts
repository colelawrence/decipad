import { dequal } from 'dequal';
import { AST, ExternalDataMap } from '@decipad/language';
import { getDependents } from './dependents';
import { ValueLocation } from '../types';
import {
  findSymbolsUsed,
  getAllSymbolsDefined,
  getDefinedSymbol,
  getSomeBlockLocations,
  iterProgram,
  LocationSet,
  setIntersection,
} from '../utils';

const getChangedMapKeys = <T>(
  oldMap: Map<string, T>,
  newMap: Map<string, T>
): string[] => {
  const allKeys = new Set(
    Array.from(oldMap.keys()).concat(Array.from(newMap.keys()))
  );

  return Array.from(allKeys).filter((key) => {
    const oldVal = oldMap.get(key);
    const newVal = newMap.get(key);

    return !dequal(oldVal, newVal);
  });
};

const getChangedExternalData = (
  oldExternalData: ExternalDataMap,
  newExternalData: ExternalDataMap
): string[] =>
  getChangedMapKeys(oldExternalData, newExternalData).map(
    (changedKey) => `externaldata:${changedKey}`
  );

const mapify = (blocks: AST.Block[]) => new Map(blocks.map((b) => [b.id, b]));
export const getChangedBlocks = (
  oldBlocks: AST.Block[],
  newBlocks: AST.Block[]
) => getChangedMapKeys(mapify(oldBlocks), mapify(newBlocks));

/**
 * Find reassigned variables, variables being used before being defined
 */
export const findSymbolErrors = (program: AST.Block[]) => {
  const reassigned = new Set<string>();
  const maybeUsedBeforeDef = new Set<string>();
  const seenDefinitions = new Set<string>();

  iterProgram(program, (stmt) => {
    const sym = getDefinedSymbol(stmt);

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
        changedBlockIds.includes(block.id) ||
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

  const dirtyLocs = new LocationSet(
    getSomeBlockLocations(oldBlocks, changedBlockIds)
  );

  const dirtySymbols = new Set([
    ...getChangedExternalData(oldExternalData, newExternalData),
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

  const toEvict: ValueLocation[] = [];

  iterProgram(oldBlocks, (_, loc) => {
    if (dirtyLocs.has(loc)) {
      toEvict.push(loc);
    }
  });

  return toEvict;
};
