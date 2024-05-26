import type { Observable, BehaviorSubject } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import type {
  AutocompleteName,
  ErrSpec,
  SerializedType,
  Result,
  Unit,
  AST,
  Parser,
  ExternalDataMap,
} from '@decipad/language-interfaces';

import type {
  IdentifiedError,
  IdentifiedResult,
  BlockDependents,
  ColumnDesc,
  NotebookResults,
  ComputeDeltaRequest,
  DimensionExplanation,
  ProgramBlock,
} from '@decipad/computer-interfaces';

export type { ErrSpec };

export interface ContextStats {
  inferProgramCount: number;
  inferStatementCount: number;
  inferExpressionCount: number;
  totalInferProgramTimeMs: number;
}

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
export interface ListenerHelper<Args extends unknown[], Ret> {
  observe(...a: Args): Observable<Ret>;
  observeWithSelector<T>(selector: (item: Ret) => T, ...a: Args): Observable<T>;
  use(...a: Args): Ret;
  useWithSelector<T>(selector: (item: Ret) => T, ...a: Args): T;
  useWithSelectorDebounced<T>(
    debounceTimeMs: number,
    selector: (item: Ret) => T,
    ...a: Args
  ): T;
  get(...a: Args): Ret;
}

export interface ComputerRequestStat {
  fullRequestElapsedTimeMs: number;
}

export interface InterpreterStats {
  evaluateCount: number;
  evaluateStatementCount: number;
}

export type ComputerStat = ComputerRequestStat &
  ContextStats &
  InterpreterStats;

export interface ComputerExpressionResultStat {
  expressionResultElapsedTimeMs: number;
}

export type ComputerStats = {
  computerRequestStat$: BehaviorSubject<ComputerStat>;
  pushComputerRequestStat: (stat: ComputerRequestStat) => void;

  pushComputerExpressionResultStat: (
    stat: ComputerExpressionResultStat
  ) => void;
  computerExpressionResultStat$: BehaviorSubject<
    ComputerExpressionResultStat & ContextStats & InterpreterStats
  >;
};

export type NotebookResultStream = BehaviorSubject<NotebookResults>;

export interface IRemoteComputer {
  // --------------- results --------------//
  results: NotebookResultStream;
  getBlockIdResult(
    blockId: string
  ): Readonly<IdentifiedError | IdentifiedResult> | undefined;
  expressionResult(_expression: AST.Expression): Promise<Result.Result>;

  // --------------- symbols --------------//
  getStatement(blockId: string): Promise<AST.Statement | undefined>;
  getSymbolDefinedInBlock(blockId: string): string | undefined;
  variableExists(name: string, inBlockIds?: string[]): Promise<boolean>;
  getAvailableIdentifier(
    prefix: string,
    start?: number,
    attemptNumberless?: boolean
  ): string;
  getParseableTypeInBlock$: ListenerHelper<
    [blockId: string],
    Parser.Parseable | Parser.ParseableDate | null | undefined
  >;
  getVarBlockId(varName: string): string | undefined;

  // --------------- types --------------//
  expressionType(expression: AST.Expression): Promise<SerializedType>;

  // --------------- push --------------//
  pushProgramBlocks(blocks: ProgramBlock[]): Promise<void>;
  pushProgramBlocksDelete(ids: string[]): Promise<void>;
  pushExternalDataUpdate(values: [string, Result.Result][]): Promise<void>;
  pushExternalDataDelete(key: string): Promise<void>;
  pushComputeDelta(req: ComputeDeltaRequest): Promise<void>;
  pushExtraProgramBlocks(id: string, blocks: ProgramBlock[]): Promise<void>;
  pushExtraProgramBlocksDelete(id: string[]): Promise<void>;

  // --------------- streams --------------//
  // --- results
  results$: ListenerHelper<[], NotebookResults>;
  getBlockIdResult$: ListenerHelper<
    [_blockId?: string | null | undefined],
    Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined
  >;

  expressionResultFromText$(decilang: string): Observable<ResultType>;
  blockResultFromText$(decilang: string): Observable<ResultType>;
  getVarResult$: ListenerHelper<
    [varName: string],
    IdentifiedError | IdentifiedResult | undefined
  >;

  // --- symbols
  getSetOfNamesDefined$: ListenerHelper<[], Set<string>>;
  getNamesDefined(inBlockId?: string): Promise<AutocompleteName[]>;
  getNamesDefined$: ListenerHelper<
    [inBlockId?: string | undefined],
    AutocompleteName[]
  >;
  blocksInUse$: ListenerHelper<string[], BlockDependents[]>;
  getSymbolDefinedInBlock$: ListenerHelper<
    [blockId: string],
    string | undefined
  >;
  getColumnNameDefinedInBlock$: ListenerHelper<
    [blockId: string],
    string | undefined
  >;

  getVarBlockId$: ListenerHelper<[varName: string], string | undefined>;
  getAllColumns$: ListenerHelper<
    [filterForBlockId?: string | undefined],
    ColumnDesc[]
  >;
  getBlockIdAndColumnId$: ListenerHelper<
    [blockId: string],
    [string, string | null] | undefined
  >;
  explainDimensions$: ListenerHelper<
    [result: Result.Result<'materialized-column'> | Result.Result<'column'>],
    Promise<DimensionExplanation[] | undefined>
  >;
  getSymbolOrTableDotColumn$: ListenerHelper<
    [blockId: string, columnId: string | null],
    string | undefined
  >;
  blockToMathML$: (blockId: string) => Observable<string>;

  // immediate compute
  computeDeltaRequest(
    req: ComputeDeltaRequest
  ): Promise<NotebookResults | null>;

  getUnitFromText(text: string): Promise<Unit.Unit[] | null>;

  // flush
  flush(): Promise<void>;

  // --------------- weird stuff for tests --------------//
  getExternalData(): Promise<ExternalDataMap>;

  getExtraProgramBlocks(): Promise<Map<string, ProgramBlock[]>>;
}
