import { dequal } from '@decipad/utils';
import { astNode, decilang, parseBlock } from '@decipad/language';
import { ComputerProgram, Program, ProgramBlock } from '../types';
import { emptyComputerProgram } from '../utils/emptyComputerProgram';

/**
 * For each item, returns the same AST if the block didn't change.
 */
export const updateChangedProgramBlocks = (
  program: ComputerProgram,
  previousProgram: ComputerProgram = emptyComputerProgram()
): Program => {
  return program.asSequence.map((block) => {
    const prev = previousProgram.asBlockIdMap.get(block.id);

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
  if (error) {
    return [
      {
        type: 'identified-error',
        errorKind: 'parse-error',
        id: '1',
        source,
        error,
      },
    ];
  } else {
    return solution.args.flatMap((stat, index) => {
      const programBlock: ProgramBlock = {
        type: 'identified-block',
        id: String(index),
        source: '',
        block: { ...astNode('block', stat), id: String(index) },
      };

      // If our statement is a table then the column rows get inlined so that the last block
      // will be a row assignment by default. So we have to reassign the table declaration to
      // a random variable in order that the last statement has the value of the table.
      if (stat.type === 'table') {
        const tableNameString = stat.args[0].args[0];
        const reassignmentVarStatement = decilang`${{
          name: `__FINAL_RETURN_VAR__${Math.random().toString().split('.')[1]}`,
        }} = ${{
          name: tableNameString,
        }}`;
        const reassginmentVarBlock: ProgramBlock = {
          type: 'identified-block',
          id: `${String(index)}_hack`,
          source: '',
          block: {
            ...astNode('block', reassignmentVarStatement),
            id: `${String(index)}_hack`,
          },
        };
        return [programBlock, reassginmentVarBlock];
      } else {
        return [programBlock];
      }
    });
  }
};
