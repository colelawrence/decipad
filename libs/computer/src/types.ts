import { AnyMapping } from '@decipad/utils';
import { AST, InjectableExternalData, Result, Parser } from '@decipad/language';
import { VisibleVariables } from './computer/getVisibleVariables';

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
  error: Parser.ParserError;
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
  block: AST.Block;
  source?: string;
};
export type ProgramBlock = UnparsedBlock | ParsedBlock;
export type Program = ProgramBlock[];

export interface UserParseError {
  elementId: string;
  error: string;
}
export interface ComputeRequest {
  program: Program;
  externalData?: AnyMapping<InjectableExternalData>;
  subscriptions?: string[];
  parseErrors?: UserParseError[];
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

/** Contains the results  */
export interface IdentifiedResult {
  blockId: string;
  error?: Parser.ParserError;
  isSyntaxError: boolean;
  results: InBlockResult[];
}

export interface InBlockResult extends Result.Result {
  blockId: string;
  statementIndex: number;
  visibleVariables: VisibleVariables;
}

export interface ResultsContextItem {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly delayedResultBlockId: string | null;
}

export interface ComputerParseStatementResult {
  statement?: AST.Statement;
  error?: Parser.ParserError;
}
