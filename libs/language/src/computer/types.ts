import { Type } from '../type';
import { AST } from '..';

export interface IdentifiedBlock {
  type: 'identified-block';
  id: string;
  source: string;
  block: AST.Block;
}

export interface IdentifiedError {
  type: 'identified-error';
  id: string;
  source: string;
  error: Error;
}

export type ValueLocation = [blockId: string, statementIdx: number];

export type UnparsedBlock = {
  type: 'unparsed-block';
  id: string;
  source: string;
};
export type ParsedBlock = {
  type: 'parsed-block';
  id: string;
  value: AST.Block;
  source?: string;
};
export type ProgramBlock = UnparsedBlock | ParsedBlock;
export type Program = ProgramBlock[];

export interface ComputeRequest {
  program: Program;
  subscriptions?: string[];
}

// User facing
export interface ComputePanic {
  type: 'compute-panic';
  message?: string;
}

export interface ComputeResponse {
  type: 'compute-response';
  updates: IdentifiedResult[];
}

export interface IdentifiedResult {
  blockId: string;
  isSyntaxError: boolean;
  results: InBlockResult[];
}

export interface InBlockResult {
  blockId: string;
  statementIndex: number;
  // TODO Interpreter.Result is not exportable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any | null;
  valueType: Type;
}
