import type { BehaviorSubject } from 'rxjs';
import type {
  AST,
  Result,
  SerializedType,
  Parser,
} from '@decipad/language-interfaces';
import type { AnyMapping } from '@decipad/utils';

export type IdentifiedBlock = {
  type: 'identified-block';
  id: string;
  block: AST.Block;
  definesVariable?: string;
  definesTableColumn?: [string, string];
  isArtificial?: boolean;
  artificiallyDerivedFrom?: Array<string>;
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
  artificiallyDerivedFrom?: Array<string>;
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

export type ComputeDeltaRequest = {
  program?: {
    upsert?: ProgramBlock[];
    remove?: string[];
  };
  extra?: {
    upsert?: Map<string, ProgramBlock[]>;
    remove?: string[];
  };
  external?: {
    upsert?: AnyMapping<Result.Result>;
    remove?: string[];
  };
};
export type ComputeDeltaRequestWithDone = ComputeDeltaRequest & {
  done: () => unknown;
};

export interface ComputerProgram {
  asSequence: Program;
  asBlockIdMap: Map<string, ProgramBlock>;
}

export interface BlockDependents {
  varName: string;
  dependentBlockIds: string[];
  inBlockId?: string;
}

export type BlockResult = Readonly<IdentifiedResult | IdentifiedError>;

// User facing
export interface NotebookResults {
  readonly blockResults: {
    readonly [blockId: string]: BlockResult;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
}

export type NotebookResultStream = BehaviorSubject<NotebookResults>;

export interface ColumnDesc {
  tableName: string;
  columnName: string;
  result: Result.Result<'column'>;
  blockId?: string;
  readableTableName?: string;
  blockType?: SerializedType;
}

export interface TableDesc {
  id: string;
  tableName: string;
}

export interface MaterializedColumnDesc {
  tableName: string;
  readableTableName?: string;
  columnName: string;
  result: Result.Result<'materialized-column'>;
  blockId?: string;
  blockType?: SerializedType;
}

export interface DimensionExplanation {
  indexedBy: string | undefined;
  labels: readonly string[] | undefined;
  dimensionLength: number;
}

export interface VisibleVariables {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
}

export type LabelInfo = {
  indexName?: string;
  label?: string;
  indexAtThisDimension: number;
  lengthAtThisDimension: number;
  productOfRemainingLengths?: number;
  indexesOfRemainingLengthsAreZero?: boolean;
};

export type ResultAndLabelInfo = {
  result: Result.Result;
  labelInfo: LabelInfo[];
};

export type ResultType = Result.Result<
  | 'string'
  | 'number'
  | 'boolean'
  | 'function'
  | 'column'
  | 'materialized-column'
  | 'table'
  | 'materialized-table'
  | 'tree'
  | 'row'
  | 'date'
  | 'range'
  | 'pending'
  | 'nothing'
  | 'anything'
  | 'type-error'
>;
