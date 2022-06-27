import {
  AST,
  AutocompleteName,
  buildType as t,
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
  SerializedUnits,
  serializeResult,
  serializeType,
  serializeUnit,
  validateResult,
  Value,
} from '@decipad/language';
import { anyMappingToMap, getDefined } from '@decipad/utils';
import assert from 'assert';
import { dequal } from 'dequal';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
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
  ComputeResponse,
  ComputerParseStatementResult,
  IdentifiedBlock,
  IdentifiedResult,
  InBlockResult,
  ResultsContextItem,
  UserParseError,
  ValueLocation,
} from '../types';
import {
  getAllBlockLocations,
  getDefinedSymbol,
  getGoodBlocks,
  getStatement,
} from '../utils';
import { ComputationRealm } from './ComputationRealm';
import { defaultComputerResults } from './defaultComputerResults';
import { getDelayedBlockId } from './delayErrors';
import { getVisibleVariables } from './getVisibleVariables';
import { ParseRet, updateParse } from './parse';

export { getUsedIdentifiers } from './getUsedIdentifiers';

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
const computeStatement = async (
  program: AST.Block[],
  location: ValueLocation,
  realm: ComputationRealm
): Promise<[InBlockResult, Value | undefined]> => {
  const result = realm.getFromCache(location);
  let value: Value | undefined;

  if (result) {
    return [getDefined(result.result), result.value];
  }

  const [blockId, statementIndex] = location;
  const statement = getStatement(program, location);
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

  const newResult = {
    result: {
      blockId,
      statementIndex,
      ...serializeResult(valueType, value?.getData()),
      visibleVariables: getVisibleVariables(
        program,
        location[0],
        realm.inferContext
      ),
    },
    value,
  };
  realm.addToCache(location, newResult);
  return [newResult.result, value];
};

const resultsToUpdates = (results: InBlockResult[]) => {
  const ret: IdentifiedResult[] = [];

  for (const result of results) {
    const { blockId } = result;
    let identifiedResult = ret.find((r) => r.blockId === blockId);

    if (identifiedResult == null) {
      identifiedResult = {
        blockId,
        isSyntaxError: false,
        results: [],
      };
      ret.push(identifiedResult);
    }

    identifiedResult.results.push(result);
  }

  return ret;
};

export const resultFromError = (
  error: Error,
  location: ValueLocation
): InBlockResult => {
  const [blockId, statementIndex] = location;

  // Not a user-facing error, so let's hide internal details
  const message = error.message.replace(
    /^panic: (.+)$/,
    'Internal Error: $1. Please contact support'
  );

  if (!(error instanceof RuntimeError)) {
    captureException(error);
  }

  return {
    blockId,
    statementIndex,
    ...serializeResult(t.impossible(message), null),
    visibleVariables: {
      global: new Set(),
      local: new Set(),
    },
  };
};

export const computeProgram = async (
  program: AST.Block[],
  realm: ComputationRealm
): Promise<InBlockResult[]> => {
  const results: InBlockResult[] = [];
  for (const location of getAllBlockLocations(program)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value] = await computeStatement(program, location, realm);
      realm.inferContext.previousStatement = result.type;
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
  program: AST.Block[],
  [blockId, stmtIdx]: ValueLocation,
  stopIfNotFound: boolean
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();
  const { nodeTypes } = realm.inferContext;
  // Our search stops at this statement
  const findUntil = program.find((b) => b.id === blockId)?.args[stmtIdx];
  if (stopIfNotFound && !findUntil) {
    return;
  }
  for (const block of program) {
    for (const statement of block.args) {
      if (statement === findUntil) return;

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
  private previouslyParsed: ParseRet[] = [];
  private previousExternalData: ExternalDataMap = new Map();
  private computationRealm = new ComputationRealm();
  private computing = false;
  private cursorBlockId: string | null = null;
  private requestDebounceMs: number;
  private parseErrors: Map<string, UserParseError> = new Map();

  // streams
  private readonly computeRequests = new Subject<ComputeRequest>();
  public results = new BehaviorSubject<ResultsContextItem>(
    defaultComputerResults
  );

  constructor({ requestDebounceMs = 100 }: Partial<ComputerOpts> = {}) {
    this.requestDebounceMs = requestDebounceMs;
    this.wireRequestsToResults();
  }

  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        // Debounce to give React an easier time
        debounceTime(this.requestDebounceMs),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        concatMap((req) => this.computeRequest(req)),
        map((res): ResultsContextItem => {
          if (res.type === 'compute-panic') {
            captureException(new Error(res.message));
            return defaultComputerResults;
          }
          const blockResults = Object.fromEntries(
            res.updates.map((result) => [result.blockId, result])
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

  getNamesDefinedBefore$(
    location: ValueLocation,
    stopIfNotFound = true
  ): Observable<AutocompleteName[]> {
    return this.results.pipe(
      map(() => this.getNamesDefinedBefore(location, stopIfNotFound)),
      distinctUntilChanged(dequal)
    );
  }

  getVariable$(varName: string): Observable<Result.Result | null> {
    return this.results.pipe(
      map(() => this.getVariable(varName)),
      distinctUntilChanged()
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

  expressionResult$(expression: AST.Expression): Observable<Result.Result> {
    return this.results.pipe(
      concatMap(async (): Promise<Result.Result> => {
        const type = await inferExpression(
          this.computationRealm.inferContext,
          expression
        );

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
                message: 'Magic does not believe in errors',
              },
            },
          };
        }
      }),
      distinctUntilChanged(dequal)
    );
  }

  private ingestComputeRequest({
    program,
    externalData,
    parseErrors,
  }: ComputeRequest) {
    const newExternalData = anyMappingToMap(externalData ?? new Map());
    const newParse = updateParse(program, this.previouslyParsed);

    this.computationRealm.evictCache({
      oldBlocks: getGoodBlocks(this.previouslyParsed),
      newBlocks: getGoodBlocks(newParse),
      oldExternalData: this.previousExternalData,
      newExternalData,
    });

    this.computationRealm.setExternalData(newExternalData);
    this.previousExternalData = newExternalData;
    this.previouslyParsed = newParse;

    if (parseErrors) {
      this.parseErrors = new Map(
        parseErrors.map((parseError) => [parseError.elementId, parseError])
      );
    }

    return newParse;
  }

  public async computeRequest(
    req: ComputeRequest
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

      const updates: IdentifiedResult[] = [];

      for (const block of blocks) {
        if (block.type === 'identified-error') {
          updates.push({
            blockId: block.id,
            isSyntaxError: true,
            error: block.error,
            results: [],
          });
        }
      }

      updates.push(...resultsToUpdates(computeResults));

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
    this.results = new BehaviorSubject<ResultsContextItem>(
      defaultComputerResults
    );
    this.wireRequestsToResults();
  }

  /**
   * Get names for the autocomplete, and information about them
   */
  getNamesDefinedBefore(
    location: ValueLocation,
    stopIfNotFound = true
  ): AutocompleteName[] {
    const program = getGoodBlocks(this.previouslyParsed);
    return Array.from(
      findNames(this.computationRealm, program, location, stopIfNotFound)
    );
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
    const existingVars = new Set(
      this.computationRealm.inferContext.stack.globalVariables.keys()
    );
    let num = start;
    const nextProposal = () => `${prefix}${num}`;
    let proposal = nextProposal();
    while (existingVars.has(proposal)) {
      num += 1;
      proposal = nextProposal();
    }
    return proposal;
  }

  isLiteralValueOrAssignment(stmt: AST.Statement | null): boolean {
    return (
      stmt != null &&
      (stmt.type === 'literal' ||
        (stmt.type === 'assign' && stmt.args[1].type === 'literal') ||
        (stmt.type === 'matrix-assign' && stmt.args[2].type === 'literal'))
    );
  }

  async getUnitFromText(text: string): Promise<SerializedUnits | null> {
    const ast = parseOneBlock(text);
    if (!isExpression(ast.args[0])) {
      return null;
    }
    const expr = await inferExpression(
      this.computationRealm.inferContext,
      ast.args[0]
    );
    return serializeUnit(expr.unit);
  }

  parseStatement(source: string): ComputerParseStatementResult {
    const { solutions, errors } = parseBlock({ id: 'block-id', source });
    return { statement: solutions[0]?.args[0], error: errors[0] };
  }

  isExpression(statement: AST.Statement): statement is AST.Expression {
    return isExpression(statement);
  }

  getParseErrorForElement(elementId: string): UserParseError | undefined {
    return this.parseErrors.get(elementId);
  }
}
