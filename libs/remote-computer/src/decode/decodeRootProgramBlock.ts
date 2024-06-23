import type { ProgramBlock } from '@decipad/computer-interfaces';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import { decodeAST } from './decodeAST';
import type { SerializedProgramBlock } from '../types/serializedTypes';

export const decodeRootProgramBlock = (
  _ctx: ClientWorkerContext,
  programBlock: SerializedProgramBlock
): ProgramBlock | undefined => {
  if (programBlock?.type === 'identified-block') {
    return {
      ...programBlock,
      block: decodeAST(programBlock.block),
    };
  }
  return programBlock;
};
