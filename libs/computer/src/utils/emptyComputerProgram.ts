import type { ComputerProgram } from '@decipad/computer-interfaces';

export const emptyComputerProgram = (): ComputerProgram => ({
  asBlockIdMap: new Map(),
  asSequence: [],
});
