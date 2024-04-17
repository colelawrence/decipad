import type { Observable, BehaviorSubject } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import type {
  IdentifiedError,
  IdentifiedResult,
  AutocompleteName,
  BlockDependents,
  ColumnDesc,
  NotebookResults,
  ComputeRequest,
  DimensionExplanation,
  Parseable,
  ParseableDate,
  ErrSpec,
  SerializedType,
  Result,
  Unit,
  AST,
  ProgramBlock,
  ComputeRequestWithExternalData,
} from '@decipad/computer';

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

export interface RemoteComputer {
  // --------------- results --------------//
  results: NotebookResultStream;
  getBlockIdResult(
    blockId: string
  ): Readonly<IdentifiedError | IdentifiedResult> | undefined;
  expressionResult(_expression: AST.Expression): Promise<Result.Result>;

  // --------------- symbols --------------//
  getStatement(blockId: string): AST.Statement | undefined;
  getSymbolDefinedInBlock(blockId: string): string | undefined;
  variableExists(name: string, inBlockIds?: string[]): boolean;
  getAvailableIdentifier(
    prefix: string,
    start?: number,
    attemptNumberless?: boolean
  ): string;
  getParseableTypeInBlock$: ListenerHelper<
    [blockId: string],
    Parseable | ParseableDate | null | undefined
  >;
  getVarBlockId(varName: string): string | undefined;

  // --------------- types --------------//
  expressionType(expression: AST.Expression): Promise<SerializedType>;

  // --------------- push --------------//
  pushExternalDataUpdate(key: string, values: [string, Result.Result][]): void;
  pushExternalDataDelete(key: string): void;
  pushCompute(req: ComputeRequest): Promise<NotebookResults>;
  pushExtraProgramBlocks(id: string, blocks: ProgramBlock[]): void;
  pushExtraProgramBlocksDelete(id: string): void;

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
  getNamesDefined(inBlockId?: string): AutocompleteName[];
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
    [result: Result.Result<'materialized-column'>],
    Promise<DimensionExplanation[] | undefined>
  >;
  getSymbolOrTableDotColumn$: ListenerHelper<
    [blockId: string, columnId: string | null],
    string | undefined
  >;
  blockToMathML$: (blockId: string) => Observable<string>;

  // immediate compute
  computeRequest(
    req: ComputeRequestWithExternalData
  ): Promise<NotebookResults | null>;

  getUnitFromText(text: string): Promise<Unit.Unit[] | null>;

  // flush
  flush(): Promise<void>;
}
