/* eslint-disable no-underscore-dangle */
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
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
  AutocompleteNameWithSerializedType,
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
} from '@decipad/language';
import { anyMappingToMap, dequal, getDefined, identity } from '@decipad/utils';
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
  ComputerImportExternalDataOptions,
  ImportedExternalDataResult,
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
  isEmptyDelta,
} from '../utils';
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
import { updateProgram } from './updateProgram';
import type { ComputeDeltaRequestWithDone } from '../../../computer-interfaces/src/types';
import {
  getDeepLengths,
  serializeResult,
  isTableResult,
  isTable,
  isColumn,
  pushExternalData,
} from '@decipad/computer-utils';
import zip from 'lodash.zip';
import {
  computeBackendSingleton,
  dateSpecificityFromWasm,
  deserializeResult,
  kindToDeciType,
} from '@decipad/compute-backend-js';
import { ResultGenerator } from 'libs/language-interfaces/src/Result';
import { SerializedResult } from 'libs/compute-backend-js/src/serializableResult';
import { ComputingBlockState } from '../internalTypes';

export { getUsedIdentifiers } from './getUsedIdentifiers';
export type { TokenPos } from './getUsedIdentifiers';
export interface ComputerOpts {
  initialProgram?: Program;
  willTryCache?: boolean;
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
  public readonly results = this.resultStreams.global;
  public readonly computing = new BehaviorSubject<
    ComputingBlockState | undefined
  >(undefined);
  private readonly flushedSubject = new BehaviorSubject<boolean>(true);

  private deltaQueue = fnQueue({
    onError: (err) => {
      console.error('error on computer delta queue:', err);
    },
  });

  private importQueue = fnQueue({
    onError: (err) => {
      console.error('error on import queue:', err);
    },
  });

  // cache
  private triedCache: Promise<void>;
  private triedCacheCallback: (() => void) | undefined;

  constructor({ initialProgram, willTryCache = false }: ComputerOpts = {}) {
    if (willTryCache) {
      this.triedCache = new Promise((resolve) => {
        this.triedCacheCallback = resolve;
      });
    } else {
      this.triedCache = Promise.resolve();
    }

    this.wireRequestsToResults();
    if (initialProgram) {
      void this.pushComputeDelta({ program: { upsert: initialProgram } });
    }
  }

  get blocks() {
    return this.latestProgram.asSequence;
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
        new Promise<void>((resolve, reject) => {
          this.computeRequests.next({
            ...req,
            done: resolve,
            error: reject,
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
    return new Promise<void>((resolve, reject) => {
      this.computeRequests.next({
        extra: { remove: ids },
        done: resolve,
        error: reject,
      });
    });
  }

  public async pushExternalDataUpdate(
    values: Array<[string, Result.Result]>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.computeRequests.next({
        external: { upsert: new Map(values) },
        done: resolve,
        error: reject,
      });
    });
  }

  public async pushExternalDataDelete(key: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.computeRequests.next({
        external: { remove: key },
        done: resolve,
        error: reject,
      });
    });
  }

  public async releaseExternalData(id: string): Promise<void> {
    computeBackendSingleton.computeBackend.release_external_data(id);
  }
  public async importExternalData({
    id,
    name,
    data,
    importer,
    importOptions,
    metaColumnOptions,
  }: ComputerImportExternalDataOptions): Promise<ImportedExternalDataResult> {
    return this.importQueue.push(() =>
      this.waitForTriedCache().then(async () => {
        const tableResult =
          computeBackendSingleton.computeBackend.import_external_data_from_u8_arr(
            data,
            importer,
            importOptions
          );

        const table: Result.Result = {
          type: {
            kind: 'table',
            columnTypes: tableResult
              .map((col): SerializedType | undefined => {
                const columnType = importOptions.column_types?.[col.name];

                // not a fan of the as here
                const deciType = columnType ?? kindToDeciType(col.column_type);

                const date =
                  'specificity' in deciType ? deciType.specificity : undefined;

                // TODO: fix the AS here. Use satisfies.

                const metaColumn = metaColumnOptions[col.name];

                if (metaColumn?.isHidden) {
                  return undefined;
                }

                return {
                  kind: deciType.type,
                  date: date && dateSpecificityFromWasm(date),
                  unit: metaColumn?.unit,
                } as SerializedType;
              })
              .filter((col): col is SerializedType => col != null),
            columnNames: tableResult
              .map((col) =>
                metaColumnOptions[col.name]?.isHidden
                  ? undefined
                  : metaColumnOptions[col.name]?.desiredName ?? col.name
              )
              .filter((name): name is string => name != null),
            indexName: tableResult[0].name,
          },
          value: tableResult
            .map((col) => {
              const metaColumn = metaColumnOptions[col.name];
              if (metaColumn?.isHidden) {
                return undefined;
              }
              const columnsGenerator: ResultGenerator = async function* colGen(
                start,
                end
              ) {
                const slice =
                  computeBackendSingleton.computeBackend.get_slice(
                    col.id,
                    BigInt(start ?? 0),
                    BigInt((Number.isFinite(end ?? 0) ? end : -1) ?? -1)
                  ) ?? [];

                const fullResult = deserializeResult(
                  slice as SerializedResult
                ) as Result.Result<'column'>;

                if (fullResult.type.kind !== 'column') {
                  throw new Error('oops');
                }

                yield* fullResult.value(start, end);
              };

              columnsGenerator.WASM_ID = col.id;
              columnsGenerator.WASM_REALM_ID = 'compute-backend';

              return columnsGenerator;
            })
            .filter((col) => col != null),
        };

        const x: Record<string, string> = {};
        for (const [k, v] of Object.entries(metaColumnOptions)) {
          if (v?.isHidden || v?.desiredName == null) {
            continue;
          }

          x[v.desiredName] = k;
        }

        await pushExternalData(this, id, name, table, x);

        return {
          id,
          columnNamesToId: Object.fromEntries(
            tableResult.map((col) => [
              metaColumnOptions[col.name]?.desiredName ?? col.name,
              col.name,
            ])
          ),
        } satisfies ImportedExternalDataResult;
      })
    );
  }

  /**
   * Wire our computeRequests stream to the "results" stream.
   */
  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        map((req) => {
          for (const upsert of req.program?.upsert ?? []) {
            if (upsert.type === 'identified-block') {
              this.computing.next([upsert.id, true]);
            }
          }
          return req;
        }),
        // Compute me some computes!
        concatMap(async ({ done, error, ...req }) => {
          try {
            const result = await this.computeDeltaRequest(req);
            return { result, done };
          } catch (err) {
            error(err);
            return {};
          }
        })
      )
      .subscribe(({ done, result }) => {
        if (result) {
          this.resultStreams.pushResults(result);
          for (const blockId of Object.keys(result?.blockResults)) {
            this.computing.next([blockId, false]);
          }
        }
        if (done) {
          done();
        }
      });
  }

  getVarBlock(varName: string): ProgramBlock | undefined {
    const isColumnName = varName.includes('.');
    if (isColumnName) {
      const columnBlock = this.latestProgram.asSequence.find((p) => {
        if (p.definesTableColumn) {
          return p.definesTableColumn.join('.') === varName;
        }
        return false;
      });
      if (columnBlock) {
        return columnBlock;
      }
    }
    const mainIdentifier = isColumnName // table.columnName
      ? varName.split('.')[0]
      : varName;

    return this.latestProgram.asSequence.find((p) => {
      if (varName === getExprRef(p.id)) {
        return true;
      } else {
        return p.definesVariable === mainIdentifier;
      }
    });
  }

  getVarBlockId(varName: string): string | undefined {
    return this.getVarBlock(varName)?.id;
  }

  computing$ = listenerHelper<
    ComputingBlockState | undefined,
    [blockId?: string],
    ComputingBlockState | undefined
  >(
    (blockId) => {
      if (blockId) {
        const observable = this.computing.pipe(
          filter((v) => v?.[0] === blockId)
        );
        const subject = new BehaviorSubject<ComputingBlockState | undefined>(
          undefined
        );
        const sub = observable.subscribe(subject);
        const oldUnsubscribe = subject.unsubscribe.bind(subject);
        subject.unsubscribe = () => {
          sub.unsubscribe();
          oldUnsubscribe();
        };
        return subject;
      }
      return this.computing;
    },
    (state, blockId) => {
      if (!blockId) {
        return state;
      }
      return state?.[0] === blockId ? state : undefined;
    }
  );

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

  getVarResult(varName: string): BlockResult | undefined {
    const blockId = this.getVarBlockId(varName);
    return blockId ? this.getBlockIdResult(blockId) : undefined;
  }

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

  private _getNamesDefined(
    inBlockId?: string
  ): AutocompleteNameWithSerializedType[] {
    const program = getGoodBlocks(this.latestProgram.asSequence);
    const toIgnore = new Set(this.automaticallyGeneratedNames);
    return Array.from(findNames(this, program, toIgnore, inBlockId));
  }

  /**
   * Get names for the autocomplete, and information about them
   */
  async getNamesDefined(inBlockId?: string) {
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

  /** Does `name` exist? Ignores a block ID if you pass the second argument */
  variableExists(name: string, inBlockIds?: string[]) {
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

  /**
   * Finds a Column, and identifies its 1 or more dimensions in an array.
   *
   * The array contains how many values each dimension has.
   */
  explainDimensions$ = listenerHelper(
    this.results,
    async (
      _,
      result: Result.Result<'materialized-column'> | Result.Result<'column'>
    ): Promise<DimensionExplanation[] | undefined> => {
      const dimensions = linearizeType(deserializeType(result.type));
      dimensions.pop(); // remove tip

      const deepLengths = await getDeepLengths(result.value);
      if (dimensions.length !== deepLengths.length) {
        console.log('MISMATCH', dimensions, deepLengths, result.type);
        return undefined;
      }

      let labels: string[][] | undefined = await result.meta?.()?.labels;
      if (!labels?.length || labels.length !== dimensions.length) {
        labels = undefined;
      }

      labels ??= getDefined(
        (
          await Promise.all(
            dimensions
              .map((d) => d.indexedBy)
              .filter(Boolean)
              .map(
                async (indexName) =>
                  this.getVarResult(getDefined(indexName))?.result?.meta?.()
                    ?.labels
              )
          )
        ).reduce((acc, l) => acc?.concat(l ?? []), [])
      );

      return zip(dimensions, deepLengths, labels).map(
        ([type, dimensionLength, thisDimLabels]) => {
          const { indexedBy: tableAbstractName } = type ?? {};
          const tableUserBlock =
            (tableAbstractName && this.getVarBlock(tableAbstractName)) ||
            undefined;
          const indexedBy =
            tableUserBlock?.definesVariable ?? tableAbstractName ?? undefined;

          return {
            indexedBy,
            labels: thisDimLabels,
            dimensionLength: dimensionLength ?? 0,
          } satisfies DimensionExplanation;
        }
      );
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
                        atParentIndex:
                          cellType.kind === 'column' ||
                          cellType.kind === 'materialized-column'
                            ? cellType.atParentIndex
                            : null,
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
                        atParentIndex:
                          cellType.kind === 'column' ||
                          cellType.kind === 'materialized-column'
                            ? cellType.atParentIndex
                            : null,
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
              const blockId: string | undefined = this.getVarBlockId(tableName);
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
      map((result) =>
        serializeResult(result.type, result.value, () => result.meta)
      ),
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
        return buildResult(serializeType(type), Unknown);
      }

      try {
        const value = await evaluateStatement(
          this.computationRealm.interpreterRealm,
          expression
        );

        return buildResult(
          serializeType(type),
          (await value.getData()) as Result.OneResult
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
          meta: undefined,
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
    this.results.next(defaultComputerResults);
    this.computationQueue = fnQueue();
    this.wireRequestsToResults();
  }

  getStatement(blockId: string): AST.Statement | undefined {
    const block = this.latestProgram?.asBlockIdMap.get(blockId)?.block;

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

  async terminate(): Promise<void> {
    // nothing to do here
  }

  // cache
  public async waitForTriedCache(): Promise<void> {
    return this.triedCache;
  }

  public async setTriedCache(): Promise<void> {
    this.triedCacheCallback?.();
  }
}

export const getComputer = (options?: ComputerOpts): Computer =>
  new Computer(options);

export const createRemoteComputerClient = getComputer; // for backend build
