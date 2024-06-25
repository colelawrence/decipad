import type {
  ComputeDeltaRequest,
  ComputerProgram,
  Program,
} from '@decipad/computer-interfaces';
import type { ExternalDataMap } from '@decipad/language-interfaces';
import { anyMappingToMap } from '@decipad/utils';

export const updateProgram = (
  currentProgram: ComputerProgram,
  currentExternalData: ExternalDataMap,
  delta: ComputeDeltaRequest
): { program: Program; externalData: ExternalDataMap } => {
  const blocks = new Map(currentProgram.asBlockIdMap);
  const { program, extra, external } = delta;
  if (program) {
    if (program.remove) {
      for (const remove of program.remove) {
        blocks.delete(remove);
      }
    }

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
  }
  if (extra) {
    if (extra.remove) {
      for (const id of extra.remove) {
        blocks.delete(id);
      }
    }
    if (extra.upsert) {
      for (const [, newOrChangedBlocks] of extra.upsert) {
        for (const block of newOrChangedBlocks) {
          blocks.set(block.id, block);
        }
      }
    }
  }

  const newExternalData = new Map(currentExternalData);
  if (external) {
    if (external.remove) {
      for (const key of external.remove) {
        newExternalData.delete(key);
      }
    }
    if (external.upsert) {
      for (const [k, v] of anyMappingToMap(external.upsert).entries()) {
        newExternalData.set(k, v);
      }
    }
  }

  return {
    program: Array.from(blocks.values()),
    externalData: newExternalData,
  };
};
