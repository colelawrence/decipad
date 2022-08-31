import { dequal } from 'dequal';
import { astNode, parseBlock } from '@decipad/language';
import {
  Program,
  IdentifiedBlock,
  IdentifiedError,
  UnparsedBlock,
} from '../types';

export type ParseRet = IdentifiedBlock | IdentifiedError;

export const wrappedParse = ({
  id,
  source,
}: Omit<UnparsedBlock, 'type'>): ParseRet => {
  const { error, solution } = parseBlock(source);

  if (error) {
    return { type: 'computer-parse-error', id, source, error };
  }

  return {
    type: 'identified-block',
    id,
    source,
    // AST.Block doesn't *really* have an ID :(
    block: { ...solution, id },
  };
};

const asParsed = ({ id, block, source }: IdentifiedBlock): ParseRet => ({
  type: 'identified-block',
  id,
  source: source ?? '',
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
        const oneStatement = wrappedParse(block);
        if (
          oneStatement.type === 'identified-block' &&
          oneStatement.block.args.length !== 1
        ) {
          throw new Error('more than one statement is not allowed');
        }
        return oneStatement;
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

/** Create a program for the computer when the source string has multiple statements
 * The computer doesn't normally support this but sometimes we need it
 */
export const createProgramFromMultipleStatements = (
  source: string
): Program => {
  const { error, solution } = parseBlock(source);
  return error
    ? [
        {
          type: 'unparsed-block',
          id: '1',
          source,
        },
      ]
    : solution.args.map((stat, index) => ({
        type: 'identified-block',
        id: String(index),
        source: '',
        block: { ...astNode('block', stat), id: String(index) },
      }));
};
