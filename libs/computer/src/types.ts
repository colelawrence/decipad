import type { AnyMapping } from '@decipad/utils';
import type {
  AST,
  InjectableExternalData,
  Result,
  Parser,
} from '@decipad/language';
import type { VisibleVariables } from './computer/getVisibleVariables';

export interface IdentifiedBlock {
  type: 'identified-block';
  id: string;
  block: AST.Block;
  source: string;
}

export type UnparsedBlock = {
  type: 'unparsed-block';
  id: string;
  source: string;
};
/** A parse error */
export interface IdentifiedError {
  type: 'computer-parse-error';
  id: string;
  source: string;
  error: Parser.ParserError;
  // So we can use it interchangeably with IdentifiedResult
  result?: undefined;
  visibleVariables?: undefined;
  variableName?: undefined;
}

/** Contains the result */
export interface IdentifiedResult {
  type: 'computer-result';
  id: string;
  variableName?: string;
  result: Result.Result;
  visibleVariables?: VisibleVariables;
  // So we can use it interchangeably with IdentifiedError
  error?: undefined;
}

export type ProgramBlock = UnparsedBlock | IdentifiedBlock;
export type Program = ProgramBlock[];

export interface UserParseError {
  elementId: string;
  error: string;
}
export interface ComputeRequest {
  program: Program;
  subscriptions?: string[];
  parseErrors?: UserParseError[];
}

export type ComputeRequestWithExternalData = ComputeRequest & {
  externalData?: AnyMapping<InjectableExternalData>;
};

// User facing
export interface ComputePanic {
  type: 'compute-panic';
  message?: string;
}

// User facing
export interface ComputeResponse {
  type: 'compute-response';
  updates: (IdentifiedResult | IdentifiedError)[];
  indexLabels: Map<string, string[]>;
}

export interface NotebookResults {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult | IdentifiedError>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
}
