import { ProgramBlock } from '..';
import { ComputerProgram } from '../types';

export const mapifyProgram = (
  blocks: ProgramBlock[]
): ComputerProgram['asBlockIdMap'] => new Map(blocks.map((b) => [b.id, b]));
