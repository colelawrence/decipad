import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  combineLatestWith,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { fnQueue } from '@decipad/fnqueue';

// eslint-disable-next-line no-restricted-imports
import type {
  AutocompleteName,
  ExternalDataMap,
  Result,
  SerializedType,
  SerializedTypes,
  Unit,
  AST,
} from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import {
  getOfType,
  evaluateStatement,
  inferExpression,
  parseExpression,
  parseExpressionOrThrow,
  runCode,
  serializeResult,
  deserializeType,
  materializeOneResult,
  serializeType,
  buildResult,
  Unknown,
} from '@decipad/language';
import {
  anyMappingToMap,
  dequal,
  getDefined,
  identity,
  zip,
} from '@decipad/utils';
import { findNames } from '../autocomplete';
import { computeProgram } from '../compute/computeProgram';
import { blocksInUse, isInUse, programDependencies } from '../dependencies';
import {
  getExprRef,
  programWithAbstractNamesAndReferences,
  statementWithAbstractRefs,
} from '../exprRefs';
import { listenerHelper } from '../hooks';
import { captureException } from '../reporting';
import { ResultStreams } from '../resultStreams';
import { dropWhileComputing } from '../tools/dropWhileComputing';
import type {
  BlockResult,
  ComputeRequest,
  ComputeRequestWithExternalData,
  ComputeRequestWithResults,
  ComputerProgram,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  Program,
  ProgramBlock,
  ColumnDesc,
  DimensionExplanation,
  TableDesc,
} from '../types';
import {
  getDefinedSymbol,
  getGoodBlocks,
  getIdentifierString,
  isTableResult,
} from '../utils';
import { isColumn } from '../utils/isColumn';
import { isTable } from '../utils/isTable';
import { ComputationRealm } from './ComputationRealm';
import { astToParseable } from './astToParseable';
import { deduplicateColumnResults } from './deduplicateColumnResults';
import { defaultComputerResults } from './defaultComputerResults';
import { emptyBlockResultSubject } from './emptyBlockSubject';
import { updateChangedProgramBlocks } from './parseUtils';
import { topologicalSort } from '../topological-sort';
import { flattenTableDeclarations } from './transformTables';
import { programToComputerProgram } from '../utils/programToComputerProgram';
import { emptyComputerProgram } from '../utils/emptyComputerProgram';
import { linearizeType } from 'libs/language-types/src/Dimension';
import { statementToML } from '../mathML/statementToML';
import omit from 'lodash.omit';

export { getUsedIdentifiers } from './getUsedIdentifiers';
export type { TokenPos } from './getUsedIdentifiers';
export interface ComputerOpts {
  initialProgram?: Program;
}

export interface IngestComputeRequestResponse {
  program: ComputerProgram;
}

export class Computer {
  private latestProgram: ComputerProgram = emptyComputerProgram();
  private latestExternalData: ExternalDataMap = new Map();
  computationRealm = new ComputationRealm({
    retrieveHumanVariableNameByGlobalVariableName: (varName) =>
      this.latestExprRefToVarNameMap.get(varName) ?? varName,
  });
  private externalData = new BehaviorSubject<
    Map<string, [id: string, injectedResult: Result.Result][]>
  >(new Map());
  private automaticallyGeneratedNames = new Set<string>();
  public latestVarNameToBlockMap: ReadonlyMap<string, ProgramBlock> = new Map();
  public latestExprRefToVarNameMap = new Map<string, string>();
  public latestBlockDependents = new Map<string, string[]>();

  // streams
  private readonly computeRequests = new Subject<ComputeRequestWithResults>();
  private readonly extraProgramBlocks = new BehaviorSubject<
    Map<string, ProgramBlock[]>
  >(new Map());
  private resultStreams = new ResultStreams(this);
  public results = this.resultStreams.global;

  private flushedSubject = new BehaviorSubject<boolean>(true);

  constructor({ initialProgram }: ComputerOpts = {}) {
    this.wireRequestsToResults();
    if (initialProgram) {
      void this.pushCompute({ program: initialProgram });
    }
  }

  /**
   * Push the entire program (all blocks), to the computer.
   *
   * @returns a promise to notify you when we are done
   * processing these results. Often you don't need to await this.
   * But it's useful.
   *
   * @see `BlockProcessor.ts`.
   */
  public async pushCompute(req: ComputeRequest): Promise<NotebookResults> {
    return new Promise<NotebookResults>((resolve) => {
      this.computeRequests.next({
        ...req,
        results: resolve,
      });
    });
  }

  public pushExtraProgramBlocks(id: string, blocks: ProgramBlock[]): void {
    const newValue = new Map(this.extraProgramBlocks.value);

    if (!dequal(blocks, this.extraProgramBlocks.value.get(id))) {
      newValue.set(id, blocks);
      this.extraProgramBlocks.next(newValue);
    }
  }

  public pushExtraProgramBlocksDelete(id: string): void {
    const newValue = new Map(this.extraProgramBlocks.value);
    const deleted = newValue.delete(id);

    if (deleted) {
      this.extraProgramBlocks.next(newValue);
    }
  }

  /**
   * Wire our computeRequests stream to the "results" stream.
   * And the externalData stream (containing imports) is integrated here.
   */
  private wireRequestsToResults() {
    this.computeRequests
      .pipe(
        combineLatestWith(this.externalData, this.extraProgramBlocks),
        map(
          ([
            { program, results, ...computeReq },
            externalData,
            extraBlocks,
          ]) => ({
            ...computeReq,
            program: [...program, ...[...extraBlocks.values()].flat()],
            externalData: [...externalData.values()].flat(),
            results,
          })
        ),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => {
          const isSameAsLast = dequal(
            omit(prevReq, ['results']),
            omit(req, ['results'])
          );

          //
          // Side-Effect
          //
          // If the current program is the same as the last one,
          // we must still resolve the promise.
          // Otherwise it will never resolve.
          //
          if (isSameAsLast) {
            req.results(this.results.getValue());
          }

          return isSameAsLast;
        }),
        // Compute me some computes!
        dropWhileComputing(
          async (req) => {
            const result = await this.computeRequest(req);
            return { ...result, results: req.results };
          },
          (pendingCount) => this.flushedSubject.next(pendingCount === 0)
        ),
        switchMap((item) => (item == null ? [] : [item])),
        shareReplay(1)
      )
      .subscribe(({ results, ...rest }) => {
        // Typescript cant figure out `blockResults` cannot be null.
        // see `switchMap` above.
        const notebookResults = getDefined(rest) as NotebookResults;

        this.resultStreams.pushResults(notebookResults);
        results(notebookResults);
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
    const parsed = this.latestProgram.asBlockIdMap.get(blockId);
    return parsed?.definesVariable;
  }

  getSymbolOrTableDotColumn$ = listenerHelper(
    this.results,
    (_, blockId: string, columnId: string | null) => {
      // Find "Table.Column"
      if (columnId) {
        const column = this.latestProgram.asBlockIdMap.get(columnId);
        if (column?.definesTableColumn) {
          return column.definesTableColumn.join('.');
        }
      }

      // Find just "Column" (or "Table.Column" when referred outside)
      const column = this.latestProgram.asBlockIdMap.get(blockId);
      if (column?.definesTableColumn) {
        return columnId
          ? column.definesTableColumn.join('.')
          : column.definesTableColumn[1];
      }

      const programBlock = this.latestProgram.asBlockIdMap.get(blockId);
      return (
        programBlock?.definesVariable || this.getSymbolDefinedInBlock(blockId)
      );
    }
  );

  /** Used for smart refs, which use [string, string | null] to identify a variable or column. May return undefined if definesVariable is unknown for the block in question */
  getBlockIdAndColumnId$ = listenerHelper(
    this.results,
    (_, blockId: string): [string, string | null] | undefined => {
      const programBlock = this.latestProgram.asBlockIdMap.get(blockId);

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
    const parsed = this.latestProgram.asBlockIdMap.get(blockId);
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
  getNamesDefined(inBlockId?: string): AutocompleteName[] {
    const program = getGoodBlocks(this.latestProgram.asSequence);
    const toIgnore = new Set(this.automaticallyGeneratedNames);
    return Array.from(findNames(this, program, toIgnore, inBlockId));
  }

  getNamesDefined$ = listenerHelper(this.results, (_, inBlockId?: string) =>
    this.getNamesDefined(inBlockId)
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
      results,
      result: Result.Result<'materialized-column'>
    ): Promise<DimensionExplanation[] | undefined> => {
      // We now have a column or matrix

      const getDeepLengths = async (
        value: Result.OneResult
      ): Promise<number[]> => {
        const materializedResult = await materializeOneResult(value);
        return Array.isArray(materializedResult)
          ? [
              materializedResult.length,
              ...(await getDeepLengths(materializedResult[0])),
            ]
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
                const statement = this.latestProgram.asBlockIdMap.get(b.id)
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
              const statement = this.latestProgram.asBlockIdMap.get(b.id)?.block
                ?.args[0];
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
        const statement = this.latestProgram.asBlockIdMap.get(block.id)?.block
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
      map(() => this.latestProgram.asBlockIdMap.get(blockId)?.block?.args[0]),
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
  private ingestComputeRequest({
    program,
    externalData,
  }: ComputeRequestWithExternalData): IngestComputeRequestResponse {
    const {
      program: newProgram,
      varNameToBlockMap,
      blockDependents,
    } = programWithAbstractNamesAndReferences(
      topologicalSort(flattenTableDeclarations(program)),
      this.latestVarNameToBlockMap
    );

    // console.log('newProgram', program);
    const newParse = topologicalSort(
      updateChangedProgramBlocks(
        programToComputerProgram(newProgram),
        this.latestProgram
      )
    );
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

  public async computeRequest(
    req: ComputeRequestWithExternalData
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
        this.reset();
        captureException(error as Error);
        return null;
      }
    }, true);
  }

  public pushExternalDataUpdate(
    key: string,
    values: [string, Result.Result][]
  ): void {
    const newValue = new Map(this.externalData.getValue());
    newValue.set(key, values);
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
    this.latestProgram = emptyComputerProgram();
    this.latestExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.computationQueue = fnQueue();
    this.wireRequestsToResults();
  }

  getStatement(blockId: string): AST.Statement | undefined {
    const block = this.latestProgram.asBlockIdMap.get(blockId)?.block;

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
  async getUnitFromText(text: string): Promise<Unit.Unit[] | null> {
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
