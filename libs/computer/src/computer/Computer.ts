import {
  DeciNumberRep,
  formatError,
  formatNumber,
  formatUnit,
} from '@decipad/format';
import Queue from 'queue';
import DeciNumber from '@decipad/number';
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
  SerializedType,
  parseExpression,
  deserializeType,
  linearizeType,
} from '@decipad/language';
import { anyMappingToMap, getDefined, identity, zip } from '@decipad/utils';
import { dequal } from 'dequal';
import produce from 'immer';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  combineLatestWith,
  concatMap,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  throttleTime,
} from 'rxjs/operators';
import { astToParseable } from './astToParseable';
import { findNames } from '../autocomplete/findNames';
import { computeProgram } from '../compute/computeProgram';
import { getExprRef, makeNamesFromIds } from '../exprRefs';
import { listenerHelper } from '../hooks';
import { captureException } from '../reporting';
import type {
  ComputeRequest,
  ComputeRequestWithExternalData,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  UserParseError,
  ProgramBlock,
} from '../types';
import { getDefinedSymbol, getGoodBlocks, getIdentifierString } from '../utils';
import { dropWhileComputing } from '../tools/dropWhileComputing';
import { ComputationRealm } from './ComputationRealm';
import { defaultComputerResults } from './defaultComputerResults';
import { updateChangedProgramBlocks } from './parseUtils';
import { topologicalSort } from './topologicalSort';
import { deduplicateColumnResults } from './deduplicateColumnResults';
import { isInUse } from '../isInUse/isInUse';

export { getUsedIdentifiers } from './getUsedIdentifiers';

export interface ColumnDesc {
  tableName: string;
  columnName: string;
  result: Result.Result<'column'>;
  blockId?: string;
}

export interface DimensionExplanation {
  indexedBy: string | undefined;
  labels: readonly string[] | undefined;
  dimensionLength: number;
}

interface ComputerOpts {
  requestDebounceMs: number;
}

type ParseErrorMap = Map<string, UserParseError>;

export class Computer {
  private locale = 'en-US';
  private latestProgram: ProgramBlock[] = [];
  private latestExternalData: ExternalDataMap = new Map();
  computationRealm = new ComputationRealm();
  public readonly requestDebounceMs: number;
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

  public pushCompute(req: ComputeRequest): void {
    this.computeRequests.next(req);
  }

  /**
   * Wire our computeRequests stream to the "results" stream.
   * Timing is handled here too (debouncing, throttling)
   * And the externalData stream (containing imports) is integrated here.
   */
  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        combineLatestWith(this.externalData),
        // Debounce to give React an easier time
        throttleTime(this.requestDebounceMs, undefined, {
          leading: false,
          trailing: true,
        }),
        map(([computeReq, externalData]) => ({ ...computeReq, externalData })),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        dropWhileComputing((req) => this.computeRequest(req)),
        switchMap((item) => (item == null ? [] : [item])),
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
      blockId?: string | null
    ): Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined =>
      results.blockResults[blockId ?? '']
  );

  getVarBlockId$ = listenerHelper(this.results, (_, varName: string) =>
    this.getVarBlockId(varName)
  );

  getVarResult$ = listenerHelper(this.results, (results, varName: string) => {
    const blockId = this.getVarBlockId(varName);
    return blockId ? results.blockResults[blockId] : undefined;
  });

  getAllColumnsIndexedBy$ = listenerHelper(
    this.results,
    (results, tableName: string) => {
      return Object.values(results.blockResults).flatMap((br) => {
        if (
          br.type === 'computer-result' &&
          br.result.type.kind === 'column' &&
          br.result.type.indexedBy === tableName
        ) {
          return [br];
        }
        return [];
      });
    }
  );

  getSymbolDefinedInBlock(blockId: string): string | undefined {
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
    } else if (parsed?.type === 'identified-error') {
      return parsed.definesVariable;
    }
    return undefined;
  }

  isInUse$ = listenerHelper(this.results, (_, ...blockIds: string[]) =>
    this.isInUse(...blockIds)
  );

  /** Is this blockId used in some expression elsewhere? */
  isInUse(...blockIds: string[]) {
    return isInUse(this, this.latestProgram, ...blockIds);
  }

  getSymbolDefinedInBlock$ = listenerHelper(
    this.results,
    (_, blockId: string) => this.getSymbolDefinedInBlock(blockId)
  );

  getParseableTypeInBlock(blockId: string) {
    const parsed = this.latestProgram.find((p) => p.id === blockId);
    if (parsed && parsed.type === 'identified-block') {
      return astToParseable(parsed.block.args[0]);
    }
    return null;
  }

  getParseableTypeInBlock$ = listenerHelper(
    this.results,
    (_, blockId: string) => this.getParseableTypeInBlock(blockId)
  );

  /**
   * Get names for the autocomplete, and information about them
   */
  getNamesDefined(blockId?: string): AutocompleteName[] {
    const program = getGoodBlocks(this.latestProgram);
    const inSymbol = blockId && this.getSymbolDefinedInBlock(blockId);
    const toIgnore = new Set(this.automaticallyGeneratedNames);
    if (inSymbol) {
      toIgnore.add(inSymbol);
    }
    return Array.from(
      findNames(this.computationRealm, program, toIgnore, inSymbol)
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

  /** Does `name` exist? Ignores a block ID if you pass the second argument */
  variableExists(name: string, inBlockId?: string) {
    return this.latestProgram.some((p) => {
      // Skip own block
      if (p.id === inBlockId) {
        return false;
      }

      if (p.definesVariable && p.definesVariable === name) {
        return true;
      }

      if (p.type === 'identified-block' && p.block.args.length > 0) {
        return getDefinedSymbol(p.block.args[0], false) === name;
      } else {
        return false;
      }
    });
  }

  /**
   * Finds a Column, and identifies its 1 or more dimensions in an array.
   *
   * The array contains how many values each dimension has.
   */
  explainDimensions$ = listenerHelper(
    this.results,
    (
      results,
      result: Result.Result<'column'>
    ): DimensionExplanation[] | undefined => {
      // We now have a column or matrix

      const getDeepLengths = (value: Result.OneResult): number[] =>
        Array.isArray(value) ? [value.length, ...getDeepLengths(value[0])] : [];

      const dimensions = linearizeType(deserializeType(result.type));

      dimensions.pop(); // remove tip

      const deepLengths = getDeepLengths(result.value);

      return zip(dimensions, deepLengths).map(([type, dimensionLength]) => {
        return {
          indexedBy: type.indexedBy ?? undefined,
          labels: results.indexLabels.get(type.indexedBy ?? ''),
          dimensionLength,
        };
      });
    }
  );

  getAllTables$ = listenerHelper(this.results, (results) => {
    return Object.entries(results.blockResults).flatMap(([id, b]) => {
      if (!b.result) return [];

      if (b.result.type.kind === 'table') {
        return { id, tableName: b.result.type.indexName || '' };
      }
      return [];
    });
  });

  public getAllColumns$ = listenerHelper(
    this.results,
    (results, filterForBlockId?: string): ColumnDesc[] => {
      return Object.values(results.blockResults)
        .flatMap((b) => {
          if (b.result?.type.kind === 'table') {
            if (filterForBlockId && b.id !== filterForBlockId) {
              return [];
            }
            // external data results in a single table
            if (this.latestExternalData.has(b.id)) {
              const extData = getDefined(this.latestExternalData.get(b.id));
              if (extData.type.kind !== 'table') {
                return [];
              }
              return b.result.type.columnNames.map(
                (columnName, columnIndex) => {
                  const result = {
                    type: {
                      kind: 'column',
                      cellType: (extData.type as SerializedTypes.Table)
                        .columnTypes[columnIndex],
                    },
                    value: (extData.value as Result.Result<'table'>['value'])[
                      columnIndex
                    ],
                  } as Result.Result<'column'>;
                  const tableName = this.getSymbolDefinedInBlock(b.id);
                  return {
                    tableName: tableName ?? 'unnamed',
                    columnName,
                    result,
                  };
                }
              );
            } else {
              const statement = this.latestProgram.find((p) => p.id === b.id)
                ?.block?.args[0];
              if (
                (statement?.type !== 'table' && statement?.type !== 'assign') ||
                !b.result?.value ||
                !b.result?.type
              ) {
                return [];
              }
              const tableName = getIdentifierString(statement.args[0]);
              return b.result.type.columnNames.map(
                (columnName, columnIndex) => {
                  const result = {
                    type: {
                      kind: 'column',
                      cellType: (
                        b.result.type as Result.Result<'table'>['type']
                      ).columnTypes[columnIndex],
                    },
                    value: (b.result.value as Result.Result<'table'>['value'])[
                      columnIndex
                    ],
                  } as Result.Result<'column'>;
                  return {
                    tableName,
                    columnName,
                    result,
                  };
                }
              );
            }
          } else if (b.result?.type.kind === 'column') {
            const statement = this.latestProgram.find((p) => p.id === b.id)
              ?.block?.args[0];
            if (statement?.type !== 'table-column-assign') {
              return [];
            }

            const tableName = getIdentifierString(statement.args[0]);
            if (filterForBlockId) {
              const blockId = this.getVarBlockId(tableName);
              if (blockId !== filterForBlockId) {
                return [];
              }
            }
            const columnName = getIdentifierString(statement.args[1]);
            return [
              {
                tableName,
                columnName,
                result: b.result as Result.Result<'column'>,
                blockId: b.id,
              },
            ];
          }

          return [];
        })
        .reduce(deduplicateColumnResults, []);
    }
  );

  public getColumnNameDefinedInBlock$ = listenerHelper(
    this.results,
    (results, blockId: string): string | undefined => {
      const block = results.blockResults[blockId];
      if (block?.result?.type.kind === 'column') {
        const statement = this.latestProgram.find((p) => p.id === block.id)
          ?.block?.args[0];
        if (statement?.type === 'table-column-assign') {
          return getIdentifierString(statement.args[1]);
        }
      }
      return undefined;
    }
  );

  expressionResultFromText$(decilang: string) {
    const exp = parseExpressionOrThrow(decilang);

    return this.results.pipe(
      concatMap(async () => this.expressionResult(exp)),
      distinctUntilChanged(dequal)
    );
  }

  private computationQueue = new Queue({
    concurrency: 1,
    autostart: true,
  });
  private enqueueComputation<T>(
    fn: () => Promise<T>,
    priority = false
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (priority) {
        this.computationQueue.unshift(() => fn().then(resolve, reject));
      } else {
        this.computationQueue.push(() => fn().then(resolve, reject));
      }
    });
  }

  async expressionResult(expression: AST.Expression): Promise<Result.Result> {
    return this.enqueueComputation(async () => {
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
    });
  }

  async expressionType(expression: AST.Expression): Promise<SerializedType> {
    return this.enqueueComputation(async () => {
      const type = await inferExpression(
        this.computationRealm.inferContext,
        expression
      );
      return serializeType(type);
    });
  }

  /** Take stock of new program (came from editorToProgram) and update caching */
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
  ): Promise<NotebookResults | null> {
    return this.enqueueComputation(async () => {
      /* istanbul ignore catch */
      try {
        const [programWithPrettyNames, automaticallyGeneratedNames] =
          makeNamesFromIds(req.program);
        this.automaticallyGeneratedNames = automaticallyGeneratedNames;
        this.computationRealm.inferContext.autoGeneratedVarNames =
          automaticallyGeneratedNames;

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
          blockResults: Object.fromEntries(
            updates.map((result) => [result.id, result])
          ),
          indexLabels: this.computationRealm.getIndexLabels(),
        };
      } catch (error) {
        console.error(error);
        this.reset();
        captureException(error as Error);
        return null;
      }
    }, true);
  }

  public pushExternalDataUpdate(key: string, value: Result.Result): void {
    const newValue = new Map(this.externalData.getValue());
    newValue.set(key, value);
    this.externalData.next(newValue);
  }

  public pushExternalDataDelete(key: string): void {
    const newValue = new Map(this.externalData.getValue());
    newValue.delete(key);
    this.externalData.next(newValue);
  }

  /**
   * Reset computer's state -- called when it panicks
   */
  reset() {
    this.latestProgram = [];
    this.latestExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.computationQueue = new Queue({
      concurrency: 1,
      autostart: true,
    });
    this.wireRequestsToResults();
  }

  getStatement(blockId: string): AST.Statement | undefined {
    const block = this.latestProgram.find(
      (block) => block.id === blockId
    )?.block;

    return block?.args[0];
  }

  /**
   * Get a unique identifier that starts with `prefix` and is not already in use.
   *
   * If `attemptNumberless` is true, then the first proposal will be `prefix` and
   * not `prefix1`.
   */
  getAvailableIdentifier(
    prefix: string,
    start: number,
    attemptNumberless = false
  ): string {
    const existingVars = new Set([
      ...this.computationRealm.inferContext.stack.globalVariables.keys(),
      ...this.computationRealm.inferContext.externalData.keys(),
      ...this.latestProgram.map((block) => block.definesVariable),
    ]);
    let num = start;
    const firstProposal = prefix;
    if (attemptNumberless && !existingVars.has(firstProposal)) {
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
    const expr = await this.enqueueComputation(() =>
      inferExpression(this.computationRealm.inferContext, ast)
    );
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

  formatNumber(type: SerializedTypes.Number, value: DeciNumber): DeciNumberRep {
    return formatNumber(
      this.locale,
      type.unit,
      value,
      type.numberFormat,
      type.numberError === 'month-day-conversion'
    );
  }

  formatUnit(unit: Unit[], value?: DeciNumber): string {
    return formatUnit(this.locale, unit, value);
  }

  formatError(error: ErrSpec): string {
    return formatError(this.locale, error);
  }
}
