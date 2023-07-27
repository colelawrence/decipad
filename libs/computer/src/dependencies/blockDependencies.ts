import type { Computer } from '../computer/Computer';
import { BlockDependents, ComputerProgram } from '../types';

const blockDependents =
  (computer: Computer, program: ComputerProgram) =>
  (blockId: string): BlockDependents | undefined => {
    const block = program.asBlockIdMap.get(blockId);
    if (!block) {
      return undefined;
    }
    const varName =
      block.definesVariable ??
      (block.definesTableColumn ? block.definesTableColumn?.join('.') : '');
    const dependents = computer.latestBlockDependents.get(block.id) ?? [];
    return {
      varName,
      dependentBlockIds: dependents,
      inBlockId: block.id,
    };
  };

export const programDependencies = (
  computer: Computer,
  program: ComputerProgram,
  ...blockIds: string[]
): BlockDependents[] =>
  blockIds
    .map(blockDependents(computer, program))
    .filter(Boolean) as BlockDependents[];

export const blocksInUse = (
  computer: Computer,
  program: ComputerProgram,
  ...blockIds: string[]
): BlockDependents[] => {
  const blocksInUseForBlockIds = programDependencies(
    computer,
    program,
    ...blockIds
  );
  return blocksInUseForBlockIds.filter(
    (blockInfo) => blockInfo.dependentBlockIds.length !== 0
  );
};

export const isInUse = (
  computer: Computer,
  program: ComputerProgram,
  ...blockIds: string[]
): boolean => {
  return blocksInUse(computer, program, ...blockIds).length !== 0;
};
