import type { AST, Parser, Result } from '@decipad/language';
import type { AnyMapping } from '@decipad/utils';
import type { BehaviorSubject } from 'rxjs';
import type { VisibleVariables } from './computer/getVisibleVariables';

export type IdentifiedBlock = {
  type: 'identified-block';
  id: string;
  block: AST.Block;
  definesVariable?: string;
  definesTableColumn?: [string, string];
  isArtificial?: boolean;
  artificiallyDerivedFrom?: string;
};

/** A parse error */
type BaseParseError = {
  type: 'identified-error';
  id: string;
  // So we can use it interchangeably with IdentifiedResult
  result?: undefined;
  visibleVariables?: undefined;
  usedNames?: undefined;
  // So we can use it interchangeably with IdentifiedBlock
  block?: undefined;
  definesVariable?: string;
  definesTableColumn?: [string, string];
  isArtificial?: boolean;
  artificiallyDerivedFrom?: string;
};
export type IdentifiedError =
  | (BaseParseError & {
      errorKind: 'parse-error';
      source: string;
      error: Parser.ParserError;
    })
  | (BaseParseError & {
      errorKind: 'dependency-cycle';
      source?: undefined;
      error?: undefined;
    });

/** Contains the result */
export interface IdentifiedResult {
  type: 'computer-result';
  id: string;
  result: Result.Result;
  epoch: bigint;
  visibleVariables?: VisibleVariables;
  /** What names were retrieved while evaluating this result? */
  usedNames?: (readonly [string, string])[];
  // So we can use it interchangeably with IdentifiedError
  error?: undefined;
}

export type ProgramBlock = IdentifiedBlock | IdentifiedError;
export type Program = ProgramBlock[];

export interface ComputeRequest {
  program: Program;
}
export interface BlocksInUseInformation {
  varName: string;
  usedInBlockId: string[];
  inBlockId?: string;
}

export type ComputeRequestWithExternalData = ComputeRequest & {
  externalData?: AnyMapping<Result.Result>;
};

// User facing
export interface NotebookResults {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult | IdentifiedError>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
}

export type NotebookResultStream = BehaviorSubject<NotebookResults>;
