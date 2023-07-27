import { ComputerProgram } from '../types';

export const emptyComputerProgram = (): ComputerProgram => ({
  asBlockIdMap: new Map(),
  asSequence: [],
});
