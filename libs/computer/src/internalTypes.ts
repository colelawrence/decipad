import type { ProgramBlock } from './types';

export type ExprRefToVarNameMap = Map<string, string>;
export type VarNameToBlockMap = Map<string, ProgramBlock>;

export type BlockDependentsMap = Map<string, string[]>;
