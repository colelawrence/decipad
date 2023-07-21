import { AST, ExternalDataMap } from '@decipad/language';
import { dequal } from '@decipad/utils';
import { getDependents } from './dependents';
import {
  findSymbolsUsed,
  getAllSymbolsDefined,
  getDefinedSymbol,
  getExistingBlockIds,
  iterProgram,
  setIntersection,
} from '../utils';
import { areProgramBlocksEqual } from './areBlocksEqual';
import { Program, ProgramBlock } from '../types';

export const getChangedMapKeys = <T>(
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

const programToBlocks = (program: Program): AST.Block[] =>
  program.map((pb) => pb.block).filter(Boolean) as AST.Block[];

const mapify = (blocks: ProgramBlock[]) =>
  new Map(blocks.map((b) => [b.id, b]));

export const getChangedBlocks = (
  oldBlocks: ProgramBlock[],
  newBlocks: ProgramBlock[]
): Set<string> => {
  const oldBlocksMap = mapify(oldBlocks);
  const newBlocksMap = mapify(newBlocks);

  const changedNameBlockIds = newBlocks
    .filter((newBlock) => {
      if (newBlock.definesVariable) {
        const old = oldBlocksMap.get(newBlock.id);
        if (old && old.definesVariable !== newBlock.definesVariable) {
          return true;
        }
      }
      if (newBlock.definesTableColumn) {
        const old = oldBlocksMap.get(newBlock.id);
        if (
          old?.definesTableColumn &&
          !dequal(old?.definesTableColumn, newBlock.definesTableColumn)
        ) {
          return true;
        }
      }
      return false;
    })
    .map((pb) => pb.id);

  return new Set([
    ...changedNameBlockIds,
    ...getChangedMapKeys(oldBlocksMap, newBlocksMap, areProgramBlocksEqual),
  ]);
};

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
  newBlocks: AST.Block[],
  changedBlockIds: Set<string>
) => {
  const codeWhichChanged = Array.from(oldBlocks)
    .concat(Array.from(newBlocks))
    .filter(
      (block) =>
        changedBlockIds.has(block.id) ||
        !oldBlocks.some((b) => b.id === block.id)
    );
  return new Set(getAllSymbolsDefined(codeWhichChanged));
};

export interface GetStatementsToEvictArgs {
  oldBlocks: ProgramBlock[];
  newBlocks: ProgramBlock[];
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

  const old = programToBlocks(oldBlocks);
  const nu = programToBlocks(newBlocks);
  const dirtyLocs = new Set(getExistingBlockIds(old, changedBlockIds));

  const dirtySymbols = new Set([
    ...getChangedMapKeys(oldExternalData, newExternalData, dequal),
    ...findSymbolsAffectedByChange(old, nu, changedBlockIds),
    ...findSymbolErrors(old),
    ...findSymbolErrors(nu),
  ]);

  const dependentsOfBlocksAndSymbols = getDependents(
    old,
    Array.from(dirtyLocs),
    dirtySymbols
  );

  for (const dep of dependentsOfBlocksAndSymbols) {
    dirtyLocs.add(dep);
  }

  return old.flatMap((b) => (dirtyLocs.has(b.id) ? b.id : []));
};
