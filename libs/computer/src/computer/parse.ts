import { dequal } from 'dequal';
import { Parser, parseBlock } from '@decipad/language';
import {
  Program,
  IdentifiedBlock,
  IdentifiedError,
  ParsedBlock,
} from '../types';

export type ParseRet = IdentifiedBlock | IdentifiedError;

export const wrappedParse = ({
  id,
  source,
}: Parser.UnparsedBlock): ParseRet => {
  const parsed = parseBlock({ id, source });

  if (parsed.errors.length) {
    return {
      type: 'identified-error',
      id,
      source,
      error: parsed.errors[0],
    };
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
};

const asParsed = ({ id, block }: ParsedBlock): ParseRet => ({
  type: 'identified-block',
  id,
  source: '',
  block: { ...block },
});

/**
 * Parse the changed bits of a program.
 * Returns the same AST if the block didn't change.
 */
export const updateParse = (
  program: Program,
  previousBlocks: ParseRet[] = []
): ParseRet[] => {
  return program.map((block) => {
    const prev = previousBlocks.find((prev) => prev.id === block.id);

    if (block.type === 'unparsed-block') {
      if (prev != null && prev.source === block.source) {
        // Unchanged block -- do not evict this one
        return prev;
      } else {
        // Block source changed
        return wrappedParse(block);
      }
    } else {
      const newBlock = asParsed(block);
      if (prev && dequal(newBlock, prev)) {
        return prev;
      } else {
        return newBlock;
      }
    }
  });
};
