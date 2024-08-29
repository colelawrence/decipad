import type { Observable } from 'rxjs';
import type {
  BlockDependents,
  ColumnDesc,
  ComputeDeltaRequest,
  DimensionExplanation,
  IdentifiedError,
  IdentifiedResult,
  NotebookResultStream,
  NotebookResults,
  ProgramBlock,
  ResultType,
} from './types';
import type {
  AST,
  AutocompleteNameWithSerializedType,
  ExternalDataMap,
  Parser,
  Result,
  SerializedType,
  Unit,
} from '@decipad/language-interfaces';
import { type ListenerHelper } from '@decipad/listener-helper';
import type { PromiseOrType } from '@decipad/utils';

export interface Computer {
  // --------------- results --------------//
  readonly results: NotebookResultStream;
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
    Parser.Parseable | Parser.ParseableDate | null | undefined
  >;
  getVarBlockId(varName: string): string | undefined;
  blocks: Iterable<ProgramBlock>;

  // --------------- types --------------//
  expressionType(expression: AST.Expression): Promise<SerializedType>;

  // --------------- push --------------//
  pushExternalDataUpdate(values: [string, Result.Result][]): Promise<void>;
  pushExternalDataDelete(key: string[]): Promise<void>;
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
  getNamesDefined(
    inBlockId?: string
  ): Promise<AutocompleteNameWithSerializedType[]>;
  getNamesDefined$: ListenerHelper<
    [inBlockId?: string | undefined],
    AutocompleteNameWithSerializedType[]
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
    PromiseOrType<DimensionExplanation[] | undefined>
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

  getUnitFromText(text: string): Promise<Unit[] | null>;

  // flush
  flush(): Promise<void>;

  // terminate
  terminate(): Promise<void>;

  // expression refs
  latestExprRefToVarNameMap: Map<string, string>;

  // --------------- weird stuff for tests --------------//
  getExternalData(): Promise<ExternalDataMap>;

  getExtraProgramBlocks(): Promise<Map<string, ProgramBlock[]>>;
}
