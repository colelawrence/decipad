import {
  DeciNumberRep,
  formatError,
  formatNumber,
  formatUnit,
} from '@decipad/format';
import {
  AST,
  AutocompleteName,
  deserializeType,
  ErrSpec,
  evaluateStatement,
  ExternalDataMap,
  inferExpression,
  linearizeType,
  parseExpression,
  parseExpressionOrThrow,
  Result,
  SerializedType,
  SerializedTypes,
  serializeType,
  Unit,
} from '@decipad/language';
import DeciNumber from '@decipad/number';
import {
  anyMappingToMap,
  getDefined,
  identity,
  zip,
  dequal,
} from '@decipad/utils';
import { fnQueue } from '@decipad/fnqueue';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  combineLatestWith,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { zip as _zip, unzip } from 'lodash';
import { TableColumn } from 'libs/language/src/parser/ast-types';
import { findNames } from '../autocomplete/findNames';
import { computeProgram } from '../compute/computeProgram';
import {
  blocksInUse,
  isInUse,
  programDependencies,
} from '../dependencies/dependencies';
import { getExprRef, makeNamesFromIds } from '../exprRefs';
import { listenerHelper } from '../hooks';
import { captureException } from '../reporting';
import { dropWhileComputing } from '../tools/dropWhileComputing';
import type {
  ComputeRequest,
  ComputeRequestWithExternalData,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  Program,
  ProgramBlock,
} from '../types';
import {
  getDefinedSymbol,
  getGoodBlocks,
  getIdentifierString,
  isTableResult,
} from '../utils';
import { astToParseable } from './astToParseable';
import { ComputationRealm } from './ComputationRealm';
import { defaultComputerResults } from './defaultComputerResults';
import { updateChangedProgramBlocks } from './parseUtils';
import { topologicalSort } from './topologicalSort';
import { flattenTableDeclarations } from './transformTables';
import { ColumnDesc, DimensionExplanation, TableDesc } from './types';
import { deduplicateColumnResults } from './deduplicateColumnResults';
import { isTable } from '../utils/isTable';
import { isColumn } from '../utils/isColumn';
import { ResultStreams } from '../resultStreams';
import { emptyBlockResultSubject } from './emptyBlockSubject';

export { getUsedIdentifiers } from './getUsedIdentifiers';
export type { TokenPos } from './getUsedIdentifiers';
interface ComputerOpts {
  initialProgram?: Program;
}

export class Computer {
  private locale = 'en-US';
  private latestProgram: ProgramBlock[] = [];
  private latestExternalData: ExternalDataMap = new Map();
  computationRealm = new ComputationRealm();
  private externalData = new BehaviorSubject<
    Map<string, [id: string, injectedResult: Result.Result][]>
  >(new Map());
  private automaticallyGeneratedNames = new Set<string>();

  // streams
  private readonly computeRequests = new Subject<ComputeRequest>();
  private readonly extraProgramBlocks = new BehaviorSubject<
    Map<string, ProgramBlock[]>
  >(new Map());
  private resultStreams = new ResultStreams();
  public results = this.resultStreams.global;

  constructor({ initialProgram }: ComputerOpts = {}) {
    this.wireRequestsToResults();
    if (initialProgram) {
      this.pushCompute({ program: initialProgram });
    }
  }

  public pushCompute(req: ComputeRequest): void {
    this.computeRequests.next(req);
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
        // Debounce to give React an easier time
        map(([{ program, ...computeReq }, externalData, extraBlocks]) => ({
          ...computeReq,
          program: [...program, ...[...extraBlocks.values()].flat()],
          externalData: [...externalData.values()].flat(),
        })),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        dropWhileComputing(async (req) => this.computeRequest(req)),
        switchMap((item) => (item == null ? [] : [item])),
        shareReplay(1)
      )
      .subscribe((results) => this.resultStreams.pushResults(results));
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

  getBlockIdResult(blockId: string) {
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

  getSymbolOrTableDotColumn$ = listenerHelper(
    this.results,
    (_, blockId: string, columnId: string | null) => {
      // Find "Table.Column"
      if (columnId) {
        const column = this.latestProgram.find((p) => p.id === columnId);
        if (column?.definesTableColumn) {
          return column.definesTableColumn.join('.');
        }
      }

      // Find just "Column" (or "Table.Column" when referred outside)
      const column = this.latestProgram.find((p) => p.id === blockId);
      if (column?.definesTableColumn) {
        return columnId
          ? column.definesTableColumn.join('.')
          : column.definesTableColumn[1];
      }

      const programBlock = this.latestProgram.find((p) => p.id === blockId);
      return (
        programBlock?.definesVariable || this.getSymbolDefinedInBlock(blockId)
      );
    }
  );

  /** Used for smart refs, which use [string, string | null] to identify a variable or column. May return undefined if definesVariable is unknown for the block in question */
  getBlockIdAndColumnId$ = listenerHelper(
    this.results,
    (_, blockId: string): [string, string | null] | undefined => {
      const programBlock = this.latestProgram.find((p) => p.id === blockId);

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
  getNamesDefined(inBlockId?: string): AutocompleteName[] {
    const program = getGoodBlocks(this.latestProgram);
    const toIgnore = new Set(this.automaticallyGeneratedNames);
    return Array.from(
      findNames(this.computationRealm, program, toIgnore, inBlockId)
    );
  }

  getNamesDefined$ = listenerHelper(this.results, (_, inBlockId?: string) =>
    this.getNamesDefined(inBlockId)
  );

  getFunctionDefinition(funcName: string): AST.FunctionDefinition | undefined {
    return this.computationRealm.inferContext.functionDefinitions.get(funcName);
  }

  getFunctionDefinition$ = listenerHelper(this.results, (_, funcName: string) =>
    this.getFunctionDefinition(funcName)
  );

  /** Does `name` exist? Ignores a block ID if you pass the second argument */
  variableExists(name: string, inBlockIds?: string[]) {
    return this.latestProgram.some((p) => {
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
    (
      results,
      result: Result.Result<'materialized-column'>
    ): DimensionExplanation[] | undefined => {
      try {
        // We now have a column or matrix

        const getDeepLengths = (value: Result.OneResult): number[] =>
          Array.isArray(value)
            ? [value.length, ...getDeepLengths(value[0])]
            : [];

        const deserialisedType = deserializeType(result.type);
        // console.log('deserialisedType', deserialisedType);
        const dimensions = linearizeType(deserialisedType);
        // console.log('dimensions', dimensions);

        dimensions.pop(); // remove tip

        const deepLengths = getDeepLengths(result.value);

        // console.log('zip', dimensions, deepLengths);

        return zip(dimensions, deepLengths).map(([type, dimensionLength]) => {
          return {
            indexedBy: type.indexedBy ?? undefined,
            labels: results.indexLabels.get(type.indexedBy ?? ''),
            dimensionLength,
          };
        });
      } catch (err) {
        // TODO: fix this
        return undefined;
      }
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
    return Object.values(results.blockResults)
      .flatMap((b) => {
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
          } else if (isColumn(b.result?.type)) {
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
        }

        return [];
      })
      .reduce(deduplicateColumnResults, []);
  }

  public getColumnNameDefinedInBlock$ = listenerHelper(
    (blockId: string) => this.resultStreams.blockSubject(blockId),
    (block): string | undefined => {
      if (isColumn(block?.result?.type)) {
        const statement = this.latestProgram.find((p) => p.id === block.id)
          ?.block?.args[0];
        if (statement?.type === 'table-column-assign') {
          return getIdentifierString(statement.args[1]);
        }
      }
      return undefined;
    }
  );

  getSetOfNamesDefined$ = listenerHelper(this.results, (): Set<string> => {
    const names = new Set<string>();
    for (const block of this.latestProgram) {
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

  async expressionResult(expression: AST.Expression): Promise<Result.Result> {
    return this.enqueueComputation(async (): Promise<Result.Result> => {
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
          value: await value.getData(),
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
    const type = await inferExpression(
      this.computationRealm.inferContext,
      expression
    );
    return serializeType(type);
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
      this.computationRealm.epoch += 1n;
      /* istanbul ignore catch */
      try {
        const programWithFlattenedTables = flattenTableDeclarations(
          req.program
        );
        const [programWithPrettyNames, automaticallyGeneratedNames] =
          makeNamesFromIds(programWithFlattenedTables);
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

        // Topological sort shuffles the order of results, which is bad for tables whose
        // columns were declared inline, so we need re-sort back to the initial order. I
        // hate this code. If anyone can think of a better way of writing it please change it.
        const sortedResults = computeResults.map((res): IdentifiedResult => {
          if (res.type !== 'computer-result') return res;
          const { result, id } = res;
          if (result.type.kind !== 'table') return res;

          // Find where the table was declared
          const declaration = req.program.find((block) => block.id === id);

          // Checking that declaration is a table
          if (!declaration || declaration.type !== 'identified-block')
            return res;
          const table = declaration.block.args[0];
          if (table.type !== 'table') return res;

          const colNames = table.args
            .filter((arg): arg is TableColumn => arg.type === 'table-column')
            .map((col) => col.args[0].args[0]);

          if (colNames.length === 0) return res;

          const { value } = result;
          if (!Array.isArray(value)) return res;

          const sorted = _zip(
            value,
            result.type.columnNames,
            result.type.columnTypes
          ).sort(([, name1], [, name2]) => {
            const indexA = colNames.indexOf(name1 as string);
            const indexB = colNames.indexOf(name2 as string);
            return indexA - indexB;
          });
          const [sortedValue, sortedColumnNames, sortedColumnTypes] =
            unzip(sorted);

          return {
            ...res,
            result: {
              value: sortedValue as typeof value,
              type: {
                ...result.type,
                columnNames: sortedColumnNames as string[],
                columnTypes: sortedColumnTypes as SerializedType[],
              },
            },
          };
        });

        const updates: (IdentifiedError | IdentifiedResult)[] = [];

        for (const block of blocks) {
          if (block.type === 'identified-error') {
            updates.push(block);
          }
        }

        updates.push(...sortedResults);

        return {
          blockResults: Object.fromEntries(
            updates.map((result) => [result.id, result])
          ),
          indexLabels: await this.computationRealm.getIndexLabels(),
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
    this.latestProgram = [];
    this.latestExternalData = new Map();
    this.computationRealm = new ComputationRealm();
    this.results = new BehaviorSubject<NotebookResults>(defaultComputerResults);
    this.computationQueue = fnQueue();
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
    const expr = await inferExpression(this.computationRealm.inferContext, ast);
    return expr.unit;
  }

  getLatestProgram(): Readonly<Program> {
    return this.latestProgram;
  }

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
