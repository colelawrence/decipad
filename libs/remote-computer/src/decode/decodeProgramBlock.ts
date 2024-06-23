import type { ProgramBlock } from '@decipad/computer-interfaces';
import { decodeAST } from './decodeAST';
import { decodeMooToken } from './decodeMooToken';
import { decodeBracketError } from './decodeBracketError';

export const decodeProgramBlock = <TBlock extends ProgramBlock>(
  block: TBlock
): ProgramBlock => {
  if (block.type === 'identified-block') {
    return {
      ...block,
      block: decodeAST(block.block),
    };
  }
  if (block.type === 'identified-error' && block.errorKind === 'parse-error') {
    return {
      ...block,
      error: {
        ...block.error,
        token: block.error?.token
          ? decodeMooToken(block.error.token)
          : undefined,
        bracketError: block.error.bracketError
          ? decodeBracketError(block.error.bracketError)
          : undefined,
      },
    };
  }
  return block;
};
