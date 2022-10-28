import {
  DeciNumber,
  formatError,
  formatNumber,
  formatUnit,
} from '@decipad/format';
import FFraction from '@decipad/fraction';
import {
  AST,
  AutocompleteName,
  ErrSpec,
  evaluateStatement,
  ExternalDataMap,
  inferExpression,
  parseExpressionOrThrow,
  Result,
  SerializedTypes,
  serializeType,
  Unit,
  InjectableExternalData,
  SerializedType,
  parseExpression,
} from '@decipad/language';
import { anyMappingToMap, identity } from '@decipad/utils';
import { dequal } from 'dequal';
import produce from 'immer';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  combineLatestWith,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { findNames } from '../autocomplete/findNames';
import { computeProgram } from '../compute/computeProgram';
import { getExprRef, makeNamesFromIds } from '../exprRefs';
import { listenerHelper } from '../hooks';
import { captureException } from '../reporting';
import type {
  ComputePanic,
  ComputeRequest,
  ComputeRequestWithExternalData,
  ComputeResponse,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  UserParseError,
  ProgramBlock,
} from '../types';
import { getDefinedSymbol, getGoodBlocks } from '../utils';
import { ComputationRealm } from './ComputationRealm';
import { defaultComputerResults } from './defaultComputerResults';
import { updateChangedProgramBlocks } from './parseUtils';
import { topologicalSort } from './topologicalSort';

export { getUsedIdentifiers } from './getUsedIdentifiers';

interface ComputerOpts {
  requestDebounceMs: number;
}

type ParseErrorMap = Map<string, UserParseError>;

export class Computer {
  private locale = 'en-US';
  private latestProgram: ProgramBlock[] = [];
  private latestExternalData: ExternalDataMap = new Map();
  computationRealm = new ComputationRealm();
  private computing = false;
  private requestDebounceMs: number;
  private externalData = new BehaviorSubject<ExternalDataMap>(new Map());
  private automaticallyGeneratedNames = new Set<string>();

  /** @deprecated Imperative parse errors */
  private imperativeParseErrors = new BehaviorSubject<ParseErrorMap>(new Map());

  // streams
  private readonly computeRequests = new Subject<ComputeRequest>();
  public results = new BehaviorSubject<NotebookResults>(defaultComputerResults);

  constructor({ requestDebounceMs = 100 }: Partial<ComputerOpts> = {}) {
    this.requestDebounceMs = requestDebounceMs;
    this.wireRequestsToResults();
  }

  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        combineLatestWith(this.externalData),
        // Debounce to give React an easier time
        debounceTime(this.requestDebounceMs),
        map(([computeReq, externalData]) => ({ ...computeReq, externalData })),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        concatMap(async (req): Promise<NotebookResults> => {
          const res = await this.computeRequest(req);

          if (res.type === 'compute-panic') {
            captureException(new Error(res.message));
            return defaultComputerResults;
          }

          return {
            blockResults: Object.fromEntries(
              res.updates.map((result) => [result.id, result])
            ),
            indexLabels: res.indexLabels,
          };
        }),
        shareReplay(1)
      )
      .subscribe(this.results);
  }

  getVarBlockId(varName: string) {
    const mainIdentifier = varName.includes('.') // table.name
      ? varName.split('.')[0]
      : varName;

    return this.latestProgram.find((p) => {
      if (varName === getExprRef(p.id)) {
        return true;
      } else if (p.type === 'identified-block' && p.block.args.length > 0) {
        return getDefinedSymbol(p.block.args[0]) === mainIdentifier;
      } else {
        return false;
      }
    })?.id;
  }

  results$ = listenerHelper(this.results, identity);

  getBlockIdResult$ = listenerHelper(
    this.results,
    (
      results,
      blockId: string
    ): Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined =>
      results.blockResults[blockId]
  );

  getVarBlockId$ = listenerHelper(this.results, (_, varName: string) =>
    this.getVarBlockId(varName)
  );

  getVarResult$ = listenerHelper(this.results, (results, varName: string) => {
    const blockId = this.getVarBlockId(varName);
    return blockId ? results.blockResults[blockId] : undefined;
  });

  getDefinedSymbolInBlock(blockId: string): string | undefined {
    const parsed = this.latestProgram.find((p) => p.id === blockId);
    if (parsed && parsed.type === 'identified-block') {
      const firstNode = parsed.block.args[0];
      if (firstNode) {
        const symbol = getDefinedSymbol(firstNode);
        if (symbol) {
          if (!this.automaticallyGeneratedNames.has(symbol)) {
            return symbol;
          }
        }
      }
    }
    return undefined;
  }

  getDefinedSymbolInBlock$ = listenerHelper(
    this.results,
    (_, blockId: string) => this.getDefinedSymbolInBlock(blockId)
  );

  /**
   * Get names for the autocomplete, and information about them
   */
  getNamesDefined(blockId?: string): AutocompleteName[] {
    const program = getGoodBlocks(this.latestProgram);
    const symbol = blockId && this.getDefinedSymbolInBlock(blockId);
    return Array.from(
      findNames(
        this.computationRealm,
        program,
        this.automaticallyGeneratedNames,
        symbol
      )
    );
  }

  getNamesDefined$ = listenerHelper(this.results, (_, blockId?: string) =>
    this.getNamesDefined(blockId)
  );

  getFunctionDefinition(funcName: string): AST.FunctionDefinition | undefined {
    return this.computationRealm.inferContext.functionDefinitions.get(funcName);
  }

  getFunctionDefinition$ = listenerHelper(this.results, (_, funcName: string) =>
    this.getFunctionDefinition(funcName)
  );

  expressionResultFromText$(decilang: string) {
    const exp = parseExpressionOrThrow(decilang);

    return this.results.pipe(
      concatMap(async () => this.expressionResult(exp)),
      distinctUntilChanged(dequal)
    );
  }

  async expressionResult(expression: AST.Expression): Promise<Result.Result> {
    const type = await inferExpression(
      this.computationRealm.inferContext,
      expression
    );

    if (type.errorCause) {
      return { value: null, type: serializeType(type) };
    }

    try {
      const value = await evaluateStatement(
        this.computationRealm.interpreterRealm,
        expression
      );

      return {
        value: value.getData(),
        type: serializeType(type),
      };
    } catch (err) {
      return {
        value: null,
        type: {
          kind: 'type-error',
          errorCause: {
            errType: 'free-form',
            message: (err as Error).message,
          },
        },
      };
    }
  }

  async expressionType(expression: AST.Expression): Promise<SerializedType> {
    const type = await inferExpression(
      this.computationRealm.inferContext,
      expression
    );
    return serializeType(type);
  }

  private ingestComputeRequest({
    program,
    externalData,
  }: ComputeRequestWithExternalData) {
    const newParse = updateChangedProgramBlocks(program, this.latestProgram);
    const sortedParse = topologicalSort(newParse);
    const newExternalData = anyMappingToMap(externalData ?? new Map());

    this.computationRealm.evictCache({
      oldBlocks: getGoodBlocks(this.latestProgram),
      newBlocks: getGoodBlocks(sortedParse),
      oldExternalData: this.latestExternalData,
      newExternalData,
    });

    this.computationRealm.setExternalData(newExternalData);
    this.latestExternalData = newExternalData;
    this.latestProgram = sortedParse;

    return sortedParse;
  }

  public async computeRequest(
    req: ComputeRequestWithExternalData
  ): Promise<ComputeResponse | ComputePanic> {
    /* istanbul ignore catch */
    try {
      if (this.computing) {
        throw new Error('the computer does not allow concurrent requests');
      }
      this.computing = true;
      const [programWithPrettyNames, automaticallyGeneratedNames] =
        makeNamesFromIds(req.program);
      this.automaticallyGeneratedNames = automaticallyGeneratedNames;

      const blocks = this.ingestComputeRequest({
        ...req,
        program: programWithPrettyNames,
      });
      const goodBlocks = getGoodBlocks(blocks);
      const computeResults = await computeProgram(
        goodBlocks,
        this.computationRealm
      );

      const updates: (IdentifiedError | IdentifiedResult)[] = [];

      for (const block of blocks) {
        if (block.type === 'identified-error') {
          updates.push(block);
        }
      }

      updates.push(...computeResults);

      return {
        type: 'compute-response',
        updates,
        indexLabels: this.computationRealm.getIndexLabels(),
      };
    } catch (error) {
      console.error(error);
      this.reset();
      return {
        type: 'compute-panic',
        message: (error as Error).message,
      };
    } finally {
      this.computing = false;
    }
  }

  public pushCompute(req: ComputeRequest): void {
    this.computeRequests.next(req);
  }

  public pushExternalDataUpdate(
    key: string,
    value: InjectableExternalData
  ): void {
    const newValue = new Map(this.externalData.getValue());
    newValue.set(key, value);
    this.externalData.next(newValue);
  }

  public pushExternalDataDelete(key: string): void {
    this.externalData.next(
      produce(this.externalData.getValue(), (externalData) => {
        externalData.delete(key);
      })
    );
  }

  /**
   * Reset computer's state -- called when it panicks
   */
  reset() {
    this.latestProgram = [];
    this.latestExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.wireRequestsToResults();
  }

  getStatement(blockId: string): AST.Statement | undefined {
    const block = this.latestProgram.find(
      (block) => block.id === blockId
    )?.block;

    return block?.args[0];
  }

  getAvailableIdentifier(prefix: string, start: number): string {
    const existingVars = new Set([
      ...this.computationRealm.inferContext.stack.globalVariables.keys(),
      ...this.computationRealm.inferContext.externalData.keys(),
    ]);
    let num = start;
    const firstProposal = prefix;
    if (existingVars.has(firstProposal)) {
      return firstProposal;
    }
    const nextProposal = () => `${prefix}${num}`;
    let proposal = nextProposal();
    while (existingVars.has(proposal)) {
      num += 1;
      proposal = nextProposal();
    }
    return proposal;
  }

  async getUnitFromText(text: string): Promise<Unit[] | null> {
    const ast = parseExpression(text).solution;
    if (!ast) {
      return null;
    }
    const expr = await inferExpression(this.computationRealm.inferContext, ast);
    return expr.unit;
  }

  /** @deprecated */
  private updateImperativeParseError(
    updater: (map: ParseErrorMap) => void
  ): void {
    const nextValue = produce(this.imperativeParseErrors.getValue(), updater);
    this.imperativeParseErrors.next(nextValue);
  }

  /** @deprecated */
  imperativelySetParseError(id: string, error: UserParseError): void {
    this.updateImperativeParseError((map) => {
      map.set(id, error);
    });
  }

  /** @deprecated */
  imperativelyUnsetParseError(id: string): void {
    this.updateImperativeParseError((map) => {
      map.delete(id);
    });
  }

  /** @deprecated */
  hasImperativelySetParseError(id: string): boolean {
    return this.imperativeParseErrors.getValue().has(id);
  }

  /** @deprecated */
  getImperativeParseError$ = listenerHelper(
    this.imperativeParseErrors,
    (errors, blockId: string) => errors.get(blockId)
  );

  // locale

  setLocale(locale: string) {
    this.locale = locale;
  }

  formatNumber(type: SerializedTypes.Number, value: FFraction): DeciNumber {
    return formatNumber(this.locale, type.unit, value, type.numberFormat);
  }

  formatUnit(unit: Unit[], value?: FFraction): string {
    return formatUnit(this.locale, unit, value);
  }

  formatError(error: ErrSpec): string {
    return formatError(this.locale, error);
  }
}
