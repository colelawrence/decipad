import { dequal } from 'dequal';
import { astNode, parseBlock } from '@decipad/language';
import { Program, ProgramBlock } from '../types';

/**
 * For each item, returns the same AST if the block didn't change.
 */
export const updateChangedProgramBlocks = (
  program: Program,
  previousBlocks: ProgramBlock[] = []
): ProgramBlock[] => {
  return program.map((block) => {
    const prev = previousBlocks.find((prev) => prev.id === block.id);

    if (prev && dequal(block, prev)) {
      return prev;
    } else {
      return block;
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
          type: 'identified-error',
          errorKind: 'parse-error',
          id: '1',
          source,
          error,
        },
      ]
    : solution.args.map((stat, index) => ({
        type: 'identified-block',
        id: String(index),
        source: '',
        block: { ...astNode('block', stat), id: String(index) },
      }));
};
