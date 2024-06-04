/* eslint-disable no-underscore-dangle */
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { fnQueue } from '@decipad/fnqueue';
import type {
  AST,
  ExternalDataMap,
  Result,
  SerializedType,
  SerializedTypes,
  Unit,
  AutocompleteName,
} from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  getOfType,
  evaluateStatement,
  inferExpression,
  parseExpression,
  parseExpressionOrThrow,
  runCode,
  deserializeType,
  serializeType,
  buildResult,
  isResultGenerator,
} from '@decipad/language';
import {
  anyMappingToMap,
  dequal,
  getDefined,
  identity,
  zip,
} from '@decipad/utils';
import type {
  BlockResult,
  Computer as ComputerInterface,
  ComputerProgram,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  Program,
  ProgramBlock,
  ColumnDesc,
  DimensionExplanation,
  TableDesc,
  ComputeDeltaRequest,
} from '@decipad/computer-interfaces';
import { listenerHelper } from '@decipad/listener-helper';
import { findNames } from '../autocomplete';
import { computeProgram } from '../compute/computeProgram';
import { blocksInUse, isInUse, programDependencies } from '../dependencies';
import {
  getExprRef,
  programWithAbstractNamesAndReferences,
  statementWithAbstractRefs,
} from '../exprRefs';
import { captureException } from '../reporting';
import { ResultStreams } from '../resultStreams';
import {
  getDefinedSymbol,
  getGoodBlocks,
  getIdentifierString,
  isTableResult,
  isEmptyDelta,
} from '../utils';
import { isColumn } from '../utils/isColumn';
import { isTable } from '../utils/isTable';
import { ComputationRealm } from './ComputationRealm';
import { astToParseable } from './astToParseable';
import { deduplicateColumnResults } from './deduplicateColumnResults';
import { defaultComputerResults } from './defaultComputerResults';
import { emptyBlockResultSubject } from './emptyBlockSubject';
import { topologicalSort } from '../topological-sort';
import { flattenTableDeclarations } from './transformTables';
import { programToComputerProgram } from '../utils/programToComputerProgram';
import { emptyComputerProgram } from '../utils/emptyComputerProgram';
import { linearizeType } from 'libs/language-types/src/Dimension';
import { statementToML } from '../mathML/statementToML';
import { count, first } from '@decipad/generator-utils';
import { updateProgram } from './updateProgram';
import type { ComputeDeltaRequestWithDone } from '../../../computer-interfaces/src/types';
import { serializeResult } from '@decipad/computer-utils';

export { getUsedIdentifiers } from './getUsedIdentifiers';
export type { TokenPos } from './getUsedIdentifiers';
export interface ComputerOpts {
  initialProgram?: Program;
}

export interface IngestComputeRequestResponse {
  program: ComputerProgram;
}

export class Computer implements ComputerInterface {
  private latestProgram: ComputerProgram = emptyComputerProgram();
  public latestExternalData: ExternalDataMap = new Map();
  computationRealm = new ComputationRealm({
    retrieveHumanVariableNameByGlobalVariableName: (varName) =>
      this.latestExprRefToVarNameMap.get(varName) ?? varName,
  });
  private automaticallyGeneratedNames = new Set<string>();
  public latestVarNameToBlockMap: ReadonlyMap<string, ProgramBlock> = new Map();
  public latestExprRefToVarNameMap = new Map<string, string>();
  public latestBlockDependents = new Map<string, string[]>();

  // streams
  private readonly computeRequests = new Subject<ComputeDeltaRequestWithDone>();
  private resultStreams = new ResultStreams(this);
  public results = this.resultStreams.global;
  private flushedSubject = new BehaviorSubject<boolean>(true);

  private deltaQueue = fnQueue({
    onError: (err) => {
      console.error('error on computer delta queue:', err);
    },
  });

  constructor({ initialProgram }: ComputerOpts = {}) {
    this.wireRequestsToResults();
    if (initialProgram) {
      void this.pushComputeDelta({ program: { upsert: initialProgram } });
    }
  }

  async getExternalData(): Promise<ExternalDataMap> {
    throw new Error('Method not implemented.');
  }
  async getExtraProgramBlocks(): Promise<Map<string, ProgramBlock[]>> {
    throw new Error('Method not implemented.');
  }

  public async pushComputeDelta(req: ComputeDeltaRequest): Promise<void> {
    if (isEmptyDelta(req)) {
      return Promise.resolve();
    }

    return this.deltaQueue.push(
      async () =>
        new Promise<void>((resolve) => {
          if (req.external?.upsert) {
            // TODO: we need to update the external data map, for now...
            this.latestExternalData = new Map([
              ...this.latestExternalData,
              ...anyMappingToMap(req.external.upsert),
            ]);
          }
          if (req.external?.remove) {
            // TODO: we need to update the external data map, for now...
            for (const key of req.external.remove) {
              this.latestExternalData = new Map(
                Object.entries(this.latestExternalData).filter(
                  ([k]) => k !== key
                )
              );
            }
          }

          this.computeRequests.next({
            ...req,
            done: resolve,
          });
        })
    );
  }

  public async pushProgramBlocks(blocks: ProgramBlock[]): Promise<void> {
    return this.pushComputeDelta({ program: { upsert: blocks } });
  }

  public async pushProgramBlocksDelete(blocksIds: string[]): Promise<void> {
    return this.pushComputeDelta({ program: { remove: blocksIds } });
  }

  public async pushExtraProgramBlocks(
    id: string,
    blocks: ProgramBlock[]
  ): Promise<void> {
    return this.pushComputeDelta({
      extra: { upsert: new Map([[id, blocks]]) },
    });
  }

  public async pushExtraProgramBlocksDelete(ids: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      this.computeRequests.next({ extra: { remove: ids }, done: resolve });
    });
  }

  public async pushExternalDataUpdate(
    values: Array<[string, Result.Result]>
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      this.computeRequests.next({
        external: { upsert: new Map(values) },
        done: resolve,
      });
    });
  }

  public async pushExternalDataDelete(key: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      this.computeRequests.next({
        external: { remove: key },
        done: resolve,
      });
    });
  }

  /**
   * Wire our computeRequests stream to the "results" stream.
   */
  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        // Compute me some computes!
        concatMap(async ({ done, ...req }) => {
          const result = await this.computeDeltaRequest(req);
          return { result, done };
        })
      )
      .subscribe(({ done, result }) => {
        if (result) {
          this.resultStreams.pushResults(result);
        }
        done();
      });
  }

  getVarBlockId(varName: string) {
    const mainIdentifier = varName.includes('.') // table.name
      ? varName.split('.')[0]
      : varName;

    return this.latestProgram.asSequence.find((p) => {
      if (varName === getExprRef(p.id)) {
        return true;
      } else {
        return p.definesVariable === mainIdentifier;
      }
    })?.id;
  }

  results$ = listenerHelper(this.results, identity);

  getBlockIdResult(blockId: string): BlockResult | undefined {
    return this.results.value.blockResults[blockId ?? ''];
  }

  getBlockIdResult$ = listenerHelper(
    (blockId?: string | null) =>
      blockId
        ? this.resultStreams.blockSubject(blockId)
        : emptyBlockResultSubject(),
    (
      result,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _blockId?: string | null
    ): Readonly<IdentifiedError> | Readonly<IdentifiedResult> | undefined => {
      return result;
    }
  );

  getVarBlockId$ = listenerHelper(this.results, (_, varName: string) =>
    this.getVarBlockId(varName)
  );

  getVarResult$ = listenerHelper(
    (varName: string) => {
      const blockId = this.getVarBlockId(varName);
      return blockId
        ? this.resultStreams.blockSubject(blockId)
        : emptyBlockResultSubject();
    },
    (result): IdentifiedError | IdentifiedResult | undefined => {
      return result;
    }
  );

  getAllColumnsIndexedBy$ = listenerHelper(
    this.results,
    (results, tableName: string) => {
      return Object.values(results.blockResults).flatMap((br) => {
        if (
          br.type === 'computer-result' &&
          isColumn(br.result.type) &&
          br.result.type.indexedBy === tableName
        ) {
          return [br];
        }
        return [];
      });
    }
  );

  getSymbolDefinedInBlock(blockId: string): string | undefined {
    const parsed = this.latestProgram?.asBlockIdMap.get(blockId);
    return parsed?.definesVariable;
  }

  getSymbolOrTableDotColumn$ = listenerHelper(
    this.results,
    (_, blockId: string, columnId: string | null) => {
      // Find "Table.Column"
      if (columnId) {
        const column = this.latestProgram?.asBlockIdMap.get(columnId);
        if (column?.definesTableColumn) {
          return column.definesTableColumn.join('.');
        }
      }

      // Find just "Column" (or "Table.Column" when referred outside)
      const column = this.latestProgram?.asBlockIdMap.get(blockId);
      if (column?.definesTableColumn) {
        return columnId
          ? column.definesTableColumn.join('.')
          : column.definesTableColumn[1];
      }

      const programBlock = this.latestProgram?.asBlockIdMap.get(blockId);
      return (
        programBlock?.definesVariable || this.getSymbolDefinedInBlock(blockId)
      );
    }
  );

  /** Used for smart refs, which use [string, string | null] to identify a variable or column. May return undefined if definesVariable is unknown for the block in question */
  getBlockIdAndColumnId$ = listenerHelper(
    this.results,
    (_, blockId: string): [string, string | null] | undefined => {
      const programBlock = this.latestProgram?.asBlockIdMap.get(blockId);

      if (programBlock?.definesTableColumn) {
        const [tableName] = programBlock.definesTableColumn;
        const tableId = this.getVarBlockId(tableName);
        if (!tableId) return undefined;

        return [tableId, blockId];
      }

      return [blockId, null];
    }
  );

  isInUse$ = listenerHelper(this.results, (_, ...blockIds: string[]) =>
    this.isInUse(...blockIds)
  );

  /** Is this blockId used in some expression elsewhere? */
  isInUse(...blockIds: string[]) {
    return isInUse(this, this.latestProgram, ...blockIds);
  }

  /** Information about block usage */
  blocksInUse$ = listenerHelper(this.results, (_, ...blockIds: string[]) =>
    this.blocksInUse(...blockIds)
  );

  blocksInUse(...blockIds: string[]) {
    return blocksInUse(this, this.latestProgram, ...blockIds);
  }

  programDependencies$ = listenerHelper(
    this.results,
    (_, ...blockIds: string[]) => this.programDependencies(...blockIds)
  );

  programDependencies(...blockIds: string[]) {
    return programDependencies(this, this.latestProgram, ...blockIds);
  }

  getSymbolDefinedInBlock$ = listenerHelper(
    this.results,
    (_, blockId: string) => this.getSymbolDefinedInBlock(blockId)
  );

  getParseableTypeInBlock(blockId: string) {
    const parsed = this.latestProgram?.asBlockIdMap.get(blockId);
    if (parsed && parsed.type === 'identified-block') {
      return astToParseable(parsed.block.args[0]);
    }
    return null;
  }

  getParseableTypeInBlock$ = listenerHelper(
    this.results,
    (_, blockId: string) => this.getParseableTypeInBlock(blockId)
  );

  private _getNamesDefined(inBlockId?: string): AutocompleteName[] {
    const program = getGoodBlocks(this.latestProgram.asSequence);
    const toIgnore = new Set(this.automaticallyGeneratedNames);
    return Array.from(findNames(this, program, toIgnore, inBlockId));
  }

  /**
   * Get names for the autocomplete, and information about them
   */
  async getNamesDefined(inBlockId?: string): Promise<AutocompleteName[]> {
    return this._getNamesDefined(inBlockId);
  }

  getNamesDefined$ = listenerHelper(this.results, (_, inBlockId?: string) =>
    this._getNamesDefined(inBlockId)
  );

  getFunctionDefinition(_funcName: string): AST.FunctionDefinition | undefined {
    const blockId = this.latestVarNameToBlockMap.get(_funcName)?.id;
    const funcName = blockId ? getExprRef(blockId) : _funcName;
    const node = this.computationRealm.inferContext.stack.get(funcName)?.node;
    return node
      ? getOfType('function-definition', getDefined(node))
      : undefined;
  }

  getFunctionDefinition$ = listenerHelper(this.results, (_, funcName: string) =>
    this.getFunctionDefinition(funcName)
  );

  private _variableExists(name: string, inBlockIds?: string[]) {
    return this.latestProgram.asSequence.some((p) => {
      // Skip own block
      if (inBlockIds?.includes(p.id)) {
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

  /** Does `name` exist? Ignores a block ID if you pass the second argument */
  async variableExists(
    name: string,
    inBlockIds?: string[] | undefined
  ): Promise<boolean> {
    return this._variableExists(name, inBlockIds);
  }

  /**
   * Finds a Column, and identifies its 1 or more dimensions in an array.
   *
   * The array contains how many values each dimension has.
   */
  explainDimensions$ = listenerHelper(
    this.results,
    async (
      results,
      result: Result.Result<'materialized-column'> | Result.Result<'column'>
    ): Promise<DimensionExplanation[] | undefined> => {
      // We now have a column or matrix

      const getDeepLengths = async (
        value: Result.OneResult
      ): Promise<number[]> => {
        if (isResultGenerator(value)) {
          return [
            await count(value()),
            ...(await getDeepLengths(await first(value()))),
          ];
        }
        return Array.isArray(value)
          ? [value.length, ...(await getDeepLengths(value[0]))]
          : [];
      };

      const deserialisedType = deserializeType(result.type);
      const dimensions = linearizeType(deserialisedType);
      dimensions.pop(); // remove tip

      const deepLengths = await getDeepLengths(result.value);
      if (dimensions.length !== deepLengths.length) {
        return undefined;
      }

      return zip(dimensions, deepLengths).map(([type, dimensionLength]) => {
        const { indexedBy: tableAbstractName } = type;
        const tableUserBlock =
          tableAbstractName &&
          this.latestVarNameToBlockMap.get(tableAbstractName);
        const indexedBy =
          (tableUserBlock && tableUserBlock.definesVariable) ??
          tableAbstractName ??
          undefined;
        return {
          indexedBy,
          labels: results.indexLabels.get(indexedBy ?? ''),
          dimensionLength,
        };
      });
    }
  );

  getAllTables$ = listenerHelper(this.results, (results): TableDesc[] => {
    return Object.entries(results.blockResults).flatMap(([id, b]) => {
      if (!b.result) return [];

      if (isTableResult(b.result)) {
        return { id, tableName: b.result.type.indexName || '' };
      }
      return [];
    });
  });

  public getAllColumns$ = listenerHelper(
    this.results,
    (results: NotebookResults, filterForBlockId?: string): ColumnDesc[] =>
      this.getAllColumns(results, filterForBlockId)
  );

  getAllColumns(
    results: NotebookResults,
    filterForBlockId?: string
  ): ColumnDesc[] {
    return (
      Object.values(results.blockResults)
        // eslint-disable-next-line complexity
        .flatMap((b) => {
          let readableTableName = this.getSymbolDefinedInBlock(b.id);
          const blockType = b.result?.type;
          if (b.type === 'computer-result') {
            if (isTableResult(b.result)) {
              if (filterForBlockId && b.id !== filterForBlockId) {
                return [];
              }
              // external data results in a single table
              if (this.latestExternalData.has(b.id)) {
                const extData = getDefined(this.latestExternalData.get(b.id));
                if (!isTable(extData.type)) {
                  return [];
                }
                return b.result.type.columnNames.map(
                  (columnName, columnIndex) => {
                    const cellType = (extData.type as SerializedTypes.Table)
                      .columnTypes[columnIndex];
                    const result = buildResult(
                      {
                        kind: 'column',
                        cellType,
                        indexedBy:
                          cellType.kind === 'column' ||
                          cellType.kind === 'materialized-column'
                            ? cellType.indexedBy
                            : '',
                      },
                      (extData.value as Result.Result<'table'>['value'])[
                        columnIndex
                      ]
                    );
                    const tableName = this.getSymbolDefinedInBlock(b.id);
                    return {
                      tableName: tableName ?? 'unnamed',
                      readableTableName,
                      columnName,
                      result,
                      blockType,
                    };
                  }
                );
              } else {
                const statement = this.latestProgram?.asBlockIdMap.get(b.id)
                  ?.block?.args[0];
                if (
                  (statement?.type !== 'table' &&
                    statement?.type !== 'assign') ||
                  !b.result?.value ||
                  !b.result?.type
                ) {
                  return [];
                }
                const tableName = getIdentifierString(statement.args[0]);
                return b.result.type.columnNames.map(
                  (columnName, columnIndex) => {
                    const cellType = (b.result.type as SerializedTypes.Table)
                      .columnTypes[columnIndex];
                    const result = buildResult(
                      {
                        kind: 'column',
                        cellType,
                        indexedBy:
                          cellType.kind === 'column' ||
                          cellType.kind === 'materialized-column'
                            ? cellType.indexedBy
                            : '',
                      },
                      (b.result.value as Result.Result<'table'>['value'])[
                        columnIndex
                      ]
                    );
                    return {
                      tableName,
                      readableTableName,
                      columnName,
                      result,
                      blockType,
                    };
                  }
                );
              }
            } else if (isColumn(b.result?.type)) {
              const statement = this.latestProgram?.asBlockIdMap.get(b.id)
                ?.block?.args[0];
              if (statement?.type !== 'table-column-assign') {
                return [];
              }

              const tableName = getIdentifierString(statement.args[0]);
              const blockId = this.getVarBlockId(tableName);
              readableTableName = this.getSymbolDefinedInBlock(blockId ?? '');
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
                  readableTableName,
                  columnName,
                  result: b.result as Result.Result<'column'>,
                  blockId: b.id,
                  blockType,
                },
              ];
            }
          }

          return [];
        })
        .reduce(deduplicateColumnResults, [])
    );
  }

  public getColumnNameDefinedInBlock$ = listenerHelper(
    (blockId: string) => this.resultStreams.blockSubject(blockId),
    (block): string | undefined => {
      if (isColumn(block?.result?.type)) {
        const statement = this.latestProgram?.asBlockIdMap.get(block.id)?.block
          ?.args[0];
        if (statement?.type === 'table-column-assign') {
          return getIdentifierString(statement.args[1]);
        }
      }
      return undefined;
    }
  );

  getSetOfNamesDefined$ = listenerHelper(this.results, (): Set<string> => {
    const names = new Set<string>();
    for (const block of this.latestProgram.asSequence) {
      if (block.definesVariable) {
        names.add(block.definesVariable);
      }
    }
    return names;
  });

  expressionResultFromText$(decilang: string) {
    const exp = parseExpressionOrThrow(decilang, true);

    return this.results.pipe(
      switchMap(async () => this.expressionResult(exp)),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );
  }

  blockResultFromText$(decilang: string) {
    return this.results.pipe(
      switchMap(async () => {
        return runCode(decilang, {
          ctx: this.computationRealm.inferContext,
          realm: this.computationRealm.interpreterRealm,
        });
      }),
      map((result) => serializeResult(result.type, result.value)),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );
  }

  blockToMathML$(blockId: string): Observable<string> {
    return this.results.pipe(
      map(() => this.latestProgram?.asBlockIdMap.get(blockId)?.block?.args[0]),
      map((_statement) => {
        let statement = _statement;
        if (statement?.type === 'assign') {
          [, statement] = statement.args;
        }
        if (statement?.type === 'ref') {
          const refName = statement.args[0];
          const block = this.latestProgram.asSequence.find(
            (block) => getExprRef(block.id) === refName
          );
          if (block) {
            statement = block.block?.args[0];
          }
        }
        return statement;
      }),
      switchMap(async (statement) =>
        statement ? `<math>${await statementToML(statement, this)}</math>` : ''
      )
    );
  }

  private computationQueue = fnQueue();
  private async enqueueComputation<T>(
    fn: () => Promise<T>,
    priority = false
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (priority) {
        this.computationQueue
          .unshift(fn)
          .then(resolve, reject)
          .catch(captureException);
      } else {
        this.computationQueue
          .push(fn)
          .then(resolve, reject)
          .catch(captureException);
      }
    });
  }

  async expressionResult(_expression: AST.Expression): Promise<Result.Result> {
    return this.enqueueComputation(async (): Promise<Result.Result> => {
      const [expression] = statementWithAbstractRefs(
        _expression,
        this.latestVarNameToBlockMap
      );
      const type = await inferExpression(
        this.computationRealm.interpreterRealm,
        expression
      );

      if (type.errorCause) {
        return buildResult(serializeType(type), Unknown, false);
      }

      try {
        const value = await evaluateStatement(
          this.computationRealm.interpreterRealm,
          expression
        );

        return buildResult(
          serializeType(type),
          (await value.getData()) as Result.OneResult,
          false
        );
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
    const type = await inferExpression(
      this.computationRealm.interpreterRealm,
      expression
    );
    return serializeType(type);
  }

  /** Take stock of new program (came from editorToProgram) and update caching */
  private ingestComputeRequest(
    delta: ComputeDeltaRequest
  ): IngestComputeRequestResponse {
    const { program, externalData } = updateProgram(
      this.latestProgram,
      this.latestExternalData,
      delta
    );
    const {
      program: newProgram,
      varNameToBlockMap,
      blockDependents,
    } = programWithAbstractNamesAndReferences(
      topologicalSort(flattenTableDeclarations(program)),
      this.latestVarNameToBlockMap
    );

    const newParse = topologicalSort(newProgram);
    const newExternalData = anyMappingToMap(externalData ?? new Map());

    const newComputerProgram = programToComputerProgram(newParse);
    const newGoodBlocksComputerProgram = programToComputerProgram(
      getGoodBlocks(newParse)
    );

    this.computationRealm.evictCache({
      oldProgram: programToComputerProgram(
        getGoodBlocks(this.latestProgram.asSequence)
      ),
      newProgram: newGoodBlocksComputerProgram,
      oldExternalData: this.latestExternalData,
      newExternalData,
    });

    this.computationRealm.setExternalData(newExternalData);
    this.latestExternalData = newExternalData;
    this.latestProgram = newComputerProgram;
    this.latestVarNameToBlockMap = varNameToBlockMap;
    this.latestExprRefToVarNameMap = new Map(
      Array.from(varNameToBlockMap.entries()).map(([varName, block]) => [
        getExprRef(block.id),
        block.definesVariable ?? varName,
      ])
    );
    this.latestBlockDependents = blockDependents;

    return {
      program: newComputerProgram,
    };
  }

  public async computeDeltaRequest(
    req: ComputeDeltaRequest
  ): Promise<NotebookResults | null> {
    return this.enqueueComputation(async () => {
      this.computationRealm.epoch += 1n;
      /* istanbul ignore catch */
      try {
        const { program } = this.ingestComputeRequest(req);
        const goodBlocks = getGoodBlocks(program.asSequence);

        const computeResults = await computeProgram(
          programToComputerProgram(goodBlocks),
          this
        );

        const updates: Array<IdentifiedError | IdentifiedResult> = [];

        for (const block of program.asSequence) {
          if (block.type === 'identified-error') {
            updates.push(block);
          }
        }

        updates.push(...computeResults);

        return {
          blockResults: Object.fromEntries(
            updates.map((result) => [result.id, result])
          ),
          indexLabels: await this.computationRealm.getIndexLabels(
            this.latestVarNameToBlockMap
          ),
        };
      } catch (error) {
        console.error(error);
        captureException(error as Error);
        return null;
      }
    }, true);
  }

  /**
   * Reset computer's state
   */
  reset() {
    console.debug('Computer was reset');
    this.latestProgram = emptyComputerProgram();
    this.latestExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.computationQueue = fnQueue();
    this.wireRequestsToResults();
  }

  _getStatement(blockId: string): AST.Statement | undefined {
    const block = this.latestProgram?.asBlockIdMap.get(blockId)?.block;

    return block?.args[0];
  }

  async getStatement(blockId: string): Promise<AST.Statement | undefined> {
    return this._getStatement(blockId);
  }

  /**
   * Get a unique identifier that starts with `prefix` and is not already in use.
   *
   * If `attemptNumberless` is true, then the first proposal will be `prefix` and
   * not `prefix1`.
   */
  getAvailableIdentifier(
    prefix: string,
    start = 2,
    attemptNumberless = true
  ): string {
    const existingVars = new Set([
      ...this.computationRealm.inferContext.stack.globalVariables.keys(),
      ...this.computationRealm.inferContext.externalData.keys(),
      ...this.latestProgram.asSequence.map((block) => block.definesVariable),
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

  /**
   * Parses a unit from text.
   * NOTE: Don't use with '%', percentages are NOT units. I will crash
   */
  async getUnitFromText(text: string): Promise<Unit[] | null> {
    if (text.trim() === '%') {
      throw new Error('% is not a unit!');
    }

    const ast = parseExpression(text).solution;
    if (!ast) {
      return null;
    }
    const [stmt] = statementWithAbstractRefs(ast, this.latestVarNameToBlockMap);
    const expr = await inferExpression(
      this.computationRealm.interpreterRealm,
      stmt
    );
    return expr.unit;
  }

  getLatestProgram(): Readonly<Program> {
    return this.latestProgram.asSequence;
  }

  // flush
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.flushedSubject.getValue()) {
        resolve();
        return;
      }
      const sub = this.flushedSubject.subscribe((flushed) => {
        if (flushed) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  }
}

export const getComputer = (options?: ComputerOpts): Computer =>
  new Computer(options);
