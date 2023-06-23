import { Program, ProgramBlock } from '../types';

const programBlockToProgramBlockMap = (
  pb: ProgramBlock
): [string, ProgramBlock] => [pb.id, pb];

export const programToProgramByBlockId = (
  program: Program
): Map<string, ProgramBlock> =>
  new Map(program.map(programBlockToProgramBlockMap));
