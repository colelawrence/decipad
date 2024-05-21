import type { ComputerProgram, Program } from '@decipad/computer-interfaces';
import { mapifyProgram } from './mapifyProgram';

export const programToComputerProgram = (
  program: Program
): ComputerProgram => ({
  asSequence: program,
  asBlockIdMap: mapifyProgram(program),
});
