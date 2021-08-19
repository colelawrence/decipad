import { dequal } from 'dequal';
import { Parser } from '..';
import { parseBlock } from '../parser';
import {
  Program,
  IdentifiedBlock,
  IdentifiedError,
  ParsedBlock,
} from './types';

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

const asParsed = ({ id, value }: ParsedBlock): ParseRet => ({
  type: 'identified-block',
  id,
  source: '',
  block: {
    ...value,
  },
});

/**
 * Parse the changed bits of a program
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
      const newB = asParsed(block);
      if (prev && dequal(newB, prev)) {
        return prev;
      } else {
        return newB;
      }
    }
  });
};
