import { Program } from '..';
import { ComputerProgram } from '../types';
import { mapifyProgram } from './mapifyProgram';

export const programToComputerProgram = (
  program: Program
): ComputerProgram => ({
  asSequence: program,
  asBlockIdMap: mapifyProgram(program),
});
