import type { Program, ProgramBlock } from '@decipad/computer-interfaces';

const programBlockToProgramBlockMap = (
  pb: ProgramBlock
): [string, ProgramBlock] => [pb.id, pb];

export const programToProgramByBlockId = (
  program: Program
): Map<string, ProgramBlock> =>
  new Map(program.map(programBlockToProgramBlockMap));
