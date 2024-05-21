// eslint-disable-next-line no-restricted-imports
import type {
  AST,
  AutocompleteName,
  Result,
  Unit,
  Parser,
} from '@decipad/language-interfaces';
import type {
  BlockDependents,
  ColumnDesc,
  ComputeRequest,
  ComputeRequestWithExternalData,
  DimensionExplanation,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  ProgramBlock,
} from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Computer } from '@decipad/computer';
import type {
  IRemoteComputer,
  ListenerHelper,
  NotebookResultStream,
  ResultType,
} from './types';
import type { Observable } from 'rxjs';

export class RemoteComputer implements IRemoteComputer {
  computer: Computer;
  results: NotebookResultStream;
  results$: ListenerHelper<[], NotebookResults>;
  getParseableTypeInBlock$: ListenerHelper<
    [blockId: string],
    Parser.Parseable | Parser.ParseableDate | null | undefined
  >;
  getBlockIdResult$: ListenerHelper<
    [_blockId?: string | null | undefined],
    Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined
  >;
  getVarResult$: ListenerHelper<
    [varName: string],
    IdentifiedError | IdentifiedResult | undefined
  >;
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
    [result: Result.Result<'materialized-column'> | Result.Result<'column'>],
    Promise<DimensionExplanation[] | undefined>
  >;
  getSymbolOrTableDotColumn$: ListenerHelper<
    [blockId: string, columnId: string | null],
    string | undefined
  >;
  blockToMathML$: (blockId: string) => Observable<string>;

  constructor(...args: ConstructorParameters<typeof Computer>) {
    const computer = new Computer(...args);
    this.computer = computer;
    this.results = computer.results;
    this.results$ = computer.results$;
    this.getParseableTypeInBlock$ = computer.getParseableTypeInBlock$;
    this.getBlockIdResult$ = computer.getBlockIdResult$;
    this.getVarResult$ = computer.getVarResult$;
    this.getSetOfNamesDefined$ = computer.getSetOfNamesDefined$;
    this.getNamesDefined$ = computer.getNamesDefined$;
    this.blocksInUse$ = computer.blocksInUse$;
    this.getSymbolDefinedInBlock$ = computer.getSymbolDefinedInBlock$;
    this.getColumnNameDefinedInBlock$ = computer.getColumnNameDefinedInBlock$;
    this.getVarBlockId$ = computer.getVarBlockId$;
    this.getAllColumns$ = computer.getAllColumns$;
    this.getBlockIdAndColumnId$ = computer.getBlockIdAndColumnId$;
    this.explainDimensions$ = computer.explainDimensions$;
    this.getSymbolOrTableDotColumn$ = computer.getSymbolOrTableDotColumn$;
    this.blockToMathML$ = computer.blockToMathML$;
  }
  getBlockIdResult(
    blockId: string
  ): Readonly<IdentifiedError | IdentifiedResult> | undefined {
    return this.results.value.blockResults[blockId];
  }
  async expressionResult(expression: AST.Expression) {
    return this.computer.expressionResult(expression);
  }
  async getStatement(blockId: string) {
    return this.computer.getStatement(blockId);
  }
  getSymbolDefinedInBlock(blockId: string) {
    return this.computer.getSymbolDefinedInBlock(blockId);
  }
  async variableExists(name: string, inBlockIds?: string[] | undefined) {
    return this.computer.variableExists(name, inBlockIds);
  }
  getAvailableIdentifier(
    prefix: string,
    start?: number | undefined,
    attemptNumberless?: boolean | undefined
  ) {
    return this.computer.getAvailableIdentifier(
      prefix,
      start,
      attemptNumberless
    );
  }

  getVarBlockId(varName: string) {
    return this.computer.getVarBlockId(varName);
  }
  expressionType(expression: AST.Expression) {
    return this.computer.expressionType(expression);
  }
  async pushExternalDataUpdate(key: string, values: [string, Result.Result][]) {
    return this.computer.pushExternalDataUpdate(key, values);
  }
  async pushExternalDataDelete(key: string): Promise<void> {
    return this.computer.pushExternalDataDelete(key);
  }
  pushCompute(req: ComputeRequest): Promise<NotebookResults> {
    return this.computer.pushCompute(req);
  }
  async pushExtraProgramBlocks(
    id: string,
    blocks: ProgramBlock[]
  ): Promise<void> {
    return this.computer.pushExtraProgramBlocks(id, blocks);
  }
  async pushExtraProgramBlocksDelete(id: string): Promise<void> {
    return this.computer.pushExtraProgramBlocksDelete(id);
  }
  expressionResultFromText$(decilang: string): Observable<ResultType> {
    return this.computer.expressionResultFromText$(decilang);
  }
  blockResultFromText$(decilang: string): Observable<ResultType> {
    return this.computer.blockResultFromText$(decilang);
  }

  async getNamesDefined(
    inBlockId?: string | undefined
  ): Promise<AutocompleteName[]> {
    return this.computer.getNamesDefined(inBlockId);
  }

  computeRequest(
    req: ComputeRequestWithExternalData
  ): Promise<NotebookResults | null> {
    return this.computer.computeRequest(req);
  }
  getUnitFromText(text: string): Promise<Unit.Unit[] | null> {
    return this.computer.getUnitFromText(text);
  }
  flush(): Promise<void> {
    return this.computer.flush();
  }

  async getExternalData(): Promise<
    Map<string, [id: string, injectedResult: Result.Result][]>
  > {
    return this.computer.externalData.value;
  }

  async getExtraProgramBlocks(): Promise<Map<string, ProgramBlock[]>> {
    return this.computer.extraProgramBlocks.value;
  }
}

export const getRemoteComputer = (
  ...args: ConstructorParameters<typeof Computer>
): RemoteComputer => new RemoteComputer(...args);
