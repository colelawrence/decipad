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
  buildType as t,
  ErrSpec,
  evaluateStatement,
  ExternalDataMap,
  inferExpression,
  inferStatement,
  isExpression,
  parseBlock,
  parseOneBlock,
  parseOneExpression,
  Result,
  RuntimeError,
  SerializedTypes,
  serializeResult,
  serializeType,
  Unit,
  validateResult,
  Value,
  InjectableExternalData,
  SerializedType,
} from '@decipad/language';
import { anyMappingToMap, getDefined } from '@decipad/utils';
import assert from 'assert';
import { dequal } from 'dequal';
import produce from 'immer';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  combineLatestWith,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { captureException } from '../reporting';
import {
  ComputePanic,
  ComputeRequest,
  ComputeRequestWithExternalData,
  ComputeResponse,
  ComputerParseStatementResult,
  IdentifiedBlock,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  UserParseError,
} from '../types';
import {
  getAllBlockIds,
  getDefinedSymbol,
  getGoodBlocks,
  getStatement,
} from '../utils';
import { ComputationRealm } from './ComputationRealm';
import { defaultComputerResults } from './defaultComputerResults';
import { getDelayedBlockId } from './delayErrors';
import { getVisibleVariables } from './getVisibleVariables';
import { ParseRet, updateParse } from './parse';
import { topologicalSort } from './topologicalSort';

export { getUsedIdentifiers } from './getUsedIdentifiers';

interface ExpressionResultOptions {
  version?: boolean;
}

type WithVersion<T> = T & {
  version?: number;
};

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
const computeStatement = async (
  program: AST.Block[],
  blockId: string,
  realm: ComputationRealm
): Promise<[IdentifiedResult, Value | undefined]> => {
  const cachedResult = realm.getFromCache(blockId);
  let value: Value | undefined;

  if (cachedResult) {
    return [getDefined(cachedResult.result), cachedResult.value];
  }

  const statement = getStatement(program, blockId);
  const valueType = await inferStatement(
    realm.inferContext,
    statement,
    undefined
  );

  if (!(valueType.errorCause != null && !valueType.functionness)) {
    value = await evaluateStatement(realm.interpreterRealm, statement);
  }

  if (value) {
    validateResult(valueType, value.getData());
  }

  const result: IdentifiedResult = {
    type: 'computer-result',
    id: blockId,
    result: serializeResult(valueType, value?.getData()),
    visibleVariables: getVisibleVariables(program, blockId, realm.inferContext),
  };
  realm.addToCache(blockId, { result, value });
  return [result, value];
};

export const resultFromError = (
  error: Error,
  blockId: string
): IdentifiedResult => {
  // Not a user-facing error, so let's hide internal details
  const message = error.message.replace(
    /^panic: (.+)$/,
    'Internal Error: $1. Please contact support'
  );

  if (!(error instanceof RuntimeError)) {
    captureException(error);
  }

  return {
    type: 'computer-result',
    id: blockId,
    result: serializeResult(t.impossible(message), null),
  };
};

export const computeProgram = async (
  program: AST.Block[],
  realm: ComputationRealm
): Promise<IdentifiedResult[]> => {
  const results: IdentifiedResult[] = [];
  for (const location of getAllBlockIds(program)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value] = await computeStatement(program, location, realm);
      realm.inferContext.previousStatement = result.result.type;
      realm.interpreterRealm.previousStatementValue = value;
      results.push(result);
    } catch (err) {
      results.push(resultFromError(err as Error, location));
      realm.inferContext.previousStatement = undefined;
      realm.interpreterRealm.previousStatementValue = undefined;
    }
  }

  return results;
};

function* findNames(
  realm: ComputationRealm,
  program: AST.Block[]
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();
  const { nodeTypes } = realm.inferContext;
  // Our search stops at this statement
  for (const block of program) {
    for (const statement of block.args) {
      const symbol = getDefinedSymbol(statement);
      if (symbol) {
        if (seenSymbols.has(symbol)) continue;
        seenSymbols.add(symbol);
      }

      const type = nodeTypes.get(statement);

      if (statement.type === 'assign' && type) {
        yield {
          kind: 'variable',
          type: serializeType(type),
          name: statement.args[0].args[0],
        };

        if (statement.args[1].type === 'table') {
          for (const col of statement.args[1].args) {
            const colType = nodeTypes.get(col);
            if (colType) {
              yield {
                kind: 'column',
                type: serializeType(colType),
                name: `${statement.args[0].args[0]}.${col.args[0].args[0]}`,
              };
            }
          }
        }
      }

      if (statement.type === 'function-definition' && type) {
        yield {
          kind: 'function',
          type: serializeType(type),
          name: statement.args[0].args[0],
        };
      }
    }
  }
}

interface ComputerOpts {
  requestDebounceMs: number;
}

export class Computer {
  private locale = 'en-US';
  private previouslyParsed: ParseRet[] = [];
  private previousExternalData: ExternalDataMap = new Map();
  private computationRealm = new ComputationRealm();
  private computing = false;
  private cursorBlockId: string | null = null;
  private requestDebounceMs: number;
  private parseErrors: Map<string, UserParseError> = new Map();
  private externalData = new BehaviorSubject<ExternalDataMap>(new Map());

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
        // Make sure the new request is actually different
        map(
          ([computeReq, externalData]) =>
            ({
              ...computeReq,
              externalData,
            } as ComputeRequestWithExternalData)
        ),
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        concatMap((req) => this.computeRequest(req)),
        map((res): NotebookResults => {
          if (res.type === 'compute-panic') {
            captureException(new Error(res.message));
            return defaultComputerResults;
          }
          const blockResults = Object.fromEntries(
            res.updates.map((result) => [result.id, result])
          );

          return {
            blockResults,
            indexLabels: res.indexLabels,
            delayedResultBlockId: getDelayedBlockId(res, this.cursorBlockId),
          };
        }),
        shareReplay(1)
      )
      .subscribe(this.results);
  }

  getVariable(varName: string): Result.Result | null {
    const { inferContext, interpreterRealm } = this.computationRealm;
    const type = inferContext.stack.get(varName, 'global');
    const value = interpreterRealm.stack.get(varName, 'global');
    return type && value
      ? { type: serializeType(type), value: value.getData() }
      : null;
  }

  getFunctionDefinition(funcName: string): AST.FunctionDefinition | undefined {
    return this.computationRealm.inferContext.functionDefinitions.get(funcName);
  }

  getBlockId$(varName: string): Observable<string | undefined> {
    const mainIdentifier = varName.includes('.') // table.name
      ? varName.split('.')[0]
      : varName;
    return this.results.pipe(
      map(() => {
        return this.previouslyParsed.find((p) => {
          if (p.type === 'identified-block' && p.block.args.length > 0) {
            const symbol = getDefinedSymbol(p.block.args[0]);
            return symbol === `var:${mainIdentifier}`;
          } else {
            return false;
          }
        })?.id;
      }),
      distinctUntilChanged()
    );
  }

  getDefinedSymbolInBlock(blockId: string): string | undefined {
    const parsed = this.previouslyParsed.find((p) => p.id === blockId);
    if (parsed && parsed.type === 'identified-block') {
      const firstNode = parsed.block.args[0];
      if (firstNode) {
        const symbol = getDefinedSymbol(firstNode);
        if (symbol) {
          if (symbol.includes(':')) {
            return symbol.split(':')[1];
          }
          return symbol;
        }
      }
    }
    return undefined;
  }

  getNamesDefined$(): Observable<AutocompleteName[]> {
    return this.results.pipe(
      map(() => this.getNamesDefined()),
      distinctUntilChanged(dequal)
    );
  }

  getVariable$(varName: string): Observable<Result.Result | null> {
    return this.results.pipe(
      map(() => this.getVariable(varName)),
      distinctUntilChanged()
    );
  }

  getFunctionDefinition$(
    funcName: string
  ): Observable<AST.FunctionDefinition | null | undefined> {
    return this.results.pipe(
      map(() => this.getFunctionDefinition(funcName)),
      distinctUntilChanged(dequal)
    );
  }

  expressionResultFromText$(
    decilang: string
  ): Observable<Result.Result | null> {
    const computerExpression = this.expressionResult$(
      parseOneExpression(decilang)
    );
    return computerExpression;
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

  expressionResult$(
    expression: AST.Expression,
    options: ExpressionResultOptions = {}
  ): Observable<WithVersion<Result.Result>> {
    let version = 0;
    return this.results.pipe(
      concatMap(async () => this.expressionResult(expression)),
      map((r) => (options.version ? { version: ++version, ...r } : r)),
      distinctUntilChanged(dequal)
    );
  }

  private ingestComputeRequest({
    program,
    externalData,
    parseErrors,
  }: ComputeRequestWithExternalData) {
    const newParse = updateParse(program, this.previouslyParsed);
    const sortedParse = topologicalSort(newParse);
    const newExternalData = anyMappingToMap(externalData ?? new Map());

    this.computationRealm.evictCache({
      oldBlocks: getGoodBlocks(this.previouslyParsed),
      newBlocks: getGoodBlocks(sortedParse),
      oldExternalData: this.previousExternalData,
      newExternalData,
    });

    this.computationRealm.setExternalData(newExternalData);
    this.previousExternalData = newExternalData;
    this.previouslyParsed = sortedParse;

    if (parseErrors) {
      this.parseErrors = new Map(
        parseErrors.map((parseError) => [parseError.elementId, parseError])
      );
    }

    return sortedParse;
  }

  public async computeRequest(
    req: ComputeRequestWithExternalData
  ): Promise<ComputeResponse | ComputePanic> {
    /* istanbul ignore catch */
    try {
      assert(
        !this.computing,
        'the computer does not allow concurrent requests'
      );
      this.computing = true;
      const blocks = this.ingestComputeRequest(req);
      const goodBlocks = getGoodBlocks(blocks);
      const computeResults = await computeProgram(
        goodBlocks,
        this.computationRealm
      );

      const updates: (IdentifiedError | IdentifiedResult)[] = [];

      for (const block of blocks) {
        if (block.type === 'computer-parse-error') {
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

  public setCursorBlockId(blockId: string | null): void {
    this.cursorBlockId = blockId;
  }

  /**
   * Reset computer's state -- called when it panicks
   */
  reset() {
    this.previouslyParsed = [];
    this.previousExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.wireRequestsToResults();
  }

  /**
   * Get names for the autocomplete, and information about them
   */
  getNamesDefined(): AutocompleteName[] {
    const program = getGoodBlocks(this.previouslyParsed);
    return Array.from(findNames(this.computationRealm, program));
  }

  getStatement(blockId: string, statementIndex: number): AST.Statement | null {
    const block = (
      this.previouslyParsed.find(
        (block) => block.id === blockId
      ) as IdentifiedBlock
    )?.block;

    return block?.args[statementIndex] ?? null;
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
    const ast = parseOneBlock(text);
    if (!isExpression(ast.args[0])) {
      return null;
    }
    const expr = await inferExpression(
      this.computationRealm.inferContext,
      ast.args[0]
    );
    return expr.unit;
  }

  parseStatement(source: string): ComputerParseStatementResult {
    const { solution, error } = parseBlock(source);
    return { statement: solution?.args[0], error };
  }

  isExpression(statement: AST.Statement): statement is AST.Expression {
    return isExpression(statement);
  }

  // User parse errors

  setParseError(id: string, error: UserParseError): void {
    this.parseErrors.set(id, error);
  }

  unsetParseError(id: string): void {
    this.parseErrors.delete(id);
  }

  hasParseError(id: string): boolean {
    return this.parseErrors.has(id);
  }

  getParseError(elementId: string): UserParseError | undefined {
    return this.parseErrors.get(elementId);
  }

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
