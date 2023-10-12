import { Observable, BehaviorSubject } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import type {
  IdentifiedError,
  IdentifiedResult,
  AST,
  AutocompleteName,
  SerializedTypes,
  BlockDependents,
  Result,
  ColumnDesc,
  NotebookResults,
  ComputeRequest,
  Unit,
  DimensionExplanation,
  Parseable,
  ParseableDate,
} from '@decipad/computer';
import { DeciNumberRep } from '@decipad/format';
import DeciNumber from '@decipad/number';
import { ProgramBlock } from '../../computer/src/types';
import { ErrSpec, SerializedType } from '@decipad/language';

export interface ContextStats {
  inferProgramCount: number;
  inferStatementCount: number;
  inferExpressionCount: number;
  totalInferProgramTimeMs: number;
}

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
  ): Readonly<IdentifiedError | IdentifiedResult>;
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
  pushCompute(req: ComputeRequest): void;
  pushExtraProgramBlocks(id: string, blocks: ProgramBlock[]): void;
  pushExtraProgramBlocksDelete(id: string): void;

  // --------------- streams --------------//
  // --- results
  results$: ListenerHelper<[], NotebookResults>;
  getBlockIdResult$: ListenerHelper<
    [_blockId?: string | null | undefined],
    Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined
  >;
  expressionResultFromText$(
    decilang: string
  ): Observable<
    Result.Result<
      | 'string'
      | 'number'
      | 'boolean'
      | 'function'
      | 'column'
      | 'materialized-column'
      | 'table'
      | 'materialized-table'
      | 'row'
      | 'date'
      | 'range'
      | 'pending'
      | 'nothing'
      | 'anything'
      | 'type-error'
    >
  >;
  getVarResult$: ListenerHelper<
    [varName: string],
    IdentifiedError | IdentifiedResult | undefined
  >;

  // --- symbols
  getSetOfNamesDefined$: ListenerHelper<[], Set<string>>;
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

  // --------------- utils --------------//
  formatNumber(type: SerializedTypes.Number, value: DeciNumber): DeciNumberRep;
  formatUnit(unit: Unit[], value?: DeciNumber): string;
  formatError(error: ErrSpec): string;
  getUnitFromText(text: string): Promise<Unit[] | null>;
  stats: ComputerStats;
}
