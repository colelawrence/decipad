import { Type } from '../type';
import { AST, InjectableExternalData } from '..';
import { AnyMapping } from '../utils';

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
export type OptionalValueLocation = [
  blockId: string,
  statementIdx: number | null
];

export type UnparsedBlock = {
  type: 'unparsed-block';
  id: string;
  source: string;
};
export type ParsedBlock = {
  type: 'parsed-block';
  id: string;
  block: AST.Block;
  source?: string;
};
export type ProgramBlock = UnparsedBlock | ParsedBlock;
export type Program = ProgramBlock[];

export interface ComputeRequest {
  program: Program;
  externalData?: AnyMapping<InjectableExternalData>;
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
  indexLabels: Map<string, string[]>;
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
