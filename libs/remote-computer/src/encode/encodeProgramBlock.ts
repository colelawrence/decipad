import type { ProgramBlock } from '@decipad/computer-interfaces';
import type { SerializedProgramBlock } from '../types/serializedTypes';
import { encodeAST } from './encodeAST';
import { encodeBracketError } from './encodeBracketError';
import { encodeMooToken } from './encodeMooToken';

export const encodeProgramBlock = (
  block: ProgramBlock
): SerializedProgramBlock => {
  if (block.type === 'identified-block') {
    return {
      ...block,
      block: encodeAST(block.block),
    };
  }
  if (block.type === 'identified-error' && block.errorKind === 'parse-error') {
    return {
      ...block,
      error: {
        ...block.error,
        token: block.error?.token
          ? encodeMooToken(block.error.token)
          : undefined,
        bracketError: block.error.bracketError
          ? encodeBracketError(block.error.bracketError)
          : undefined,
      },
    };
  }
  return block;
};
