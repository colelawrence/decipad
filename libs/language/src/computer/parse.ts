import { Parser } from '..';
import { parseBlock } from '../parser';
import { IdentifiedBlock, IdentifiedError } from './types';

export type ParseRet = IdentifiedBlock | IdentifiedError;

export const wrappedParse = ({
  id,
  source,
}: Parser.UnparsedBlock): ParseRet => {
  try {
    const parsed = parseBlock({ id, source });

    if (parsed.solutions.length !== 1) {
      throw new Error(`Syntax error: ${parsed.solutions.length} solutions`);
    }

    return {
      type: 'identified-block',
      id,
      source,
      block: {
        ...parsed.solutions[0],
        // AST.Block doesn't *really* have an ID :(
        id,
      },
    };
  } catch (error) {
    return {
      type: 'identified-error',
      id,
      source,
      error,
    };
  }
};

/**
 * Parse the changed bits of a program
 */
export const updateParse = (
  unparsedProgram: Parser.UnparsedBlock[],
  previousBlocks: ParseRet[] = []
) => {
  return unparsedProgram.map((unparsedBlock) => {
    const prev = previousBlocks.find((prev) => prev.id === unparsedBlock.id);

    if (prev != null && prev.source === unparsedBlock.source) {
      // Unchanged block -- do not evict this one
      return prev;
    } else {
      // Block source changed
      return wrappedParse(unparsedBlock);
    }
  });
};
