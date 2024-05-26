import type {
  ComputeDeltaRequest,
  ComputerProgram,
  Program,
} from '@decipad/computer-interfaces';
import type { ExternalDataMap } from '@decipad/language-interfaces';

export const updateProgram = (
  currentProgram: ComputerProgram,
  currentExternalData: ExternalDataMap,
  delta: ComputeDeltaRequest
): { program: Program; externalData: ExternalDataMap } => {
  const blocks = new Map(currentProgram.asBlockIdMap);
  const { program, extra, external } = delta;
  if (program) {
    if (program.upsert) {
      for (const upsert of program.upsert) {
        // eradicate all blocks that were artificially derived from this one
        for (const block of currentProgram.asSequence) {
          if (block.artificiallyDerivedFrom?.includes(upsert.id)) {
            blocks.delete(block.id);
          }
        }

        blocks.set(upsert.id, upsert);
      }
    }
    if (program.remove) {
      for (const remove of program.remove) {
        blocks.delete(remove);
      }
    }
  }
  if (extra) {
    if (extra.upsert) {
      for (const [, newOrChangedBlocks] of extra.upsert) {
        for (const block of newOrChangedBlocks) {
          blocks.set(block.id, block);
        }
      }
    }
    if (extra.remove) {
      for (const id of extra.remove) {
        blocks.delete(id);
      }
    }
  }

  const newExternalData = new Map(currentExternalData);
  if (external) {
    if (external.upsert) {
      for (const [k, v] of Object.entries(external.upsert)) {
        newExternalData.set(k, v);
      }
    }
    if (external.remove) {
      for (const key of external.remove) {
        newExternalData.delete(key);
      }
    }
  }

  return {
    program: Array.from(blocks.values()),
    externalData: newExternalData,
  };
};
