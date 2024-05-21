import type {
  ComputerProgram,
  ProgramBlock,
} from '@decipad/computer-interfaces';

export const mapifyProgram = (
  blocks: ProgramBlock[]
): ComputerProgram['asBlockIdMap'] => new Map(blocks.map((b) => [b.id, b]));
