import type { Program } from '..';
import type { ComputerProgram } from '../types';
import { mapifyProgram } from './mapifyProgram';

export const programToComputerProgram = (
  program: Program
): ComputerProgram => ({
  asSequence: program,
  asBlockIdMap: mapifyProgram(program),
});
