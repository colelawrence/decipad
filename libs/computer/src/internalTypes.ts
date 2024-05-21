import type { ProgramBlock } from '@decipad/computer-interfaces';

export type ExprRefToVarNameMap = Map<string, string>;
export type VarNameToBlockMap = Map<string, ProgramBlock>;
export type ReadOnlyVarNameToBlockMap = ReadonlyMap<string, ProgramBlock>;

export type BlockDependentsMap = Map<string, string[]>;
