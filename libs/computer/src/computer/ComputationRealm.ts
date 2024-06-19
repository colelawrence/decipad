import type {
  ExternalDataMap,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type * as language from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import {
  Time,
  Value,
  makeInferContext,
  ScopedRealm,
  functionCallValue,
  getResultGenerator,
} from '@decipad/language';
import { all, map } from '@decipad/generator-utils';
import type {
  ComputerProgram,
  IdentifiedResult,
} from '@decipad/computer-interfaces';
import type { GetStatementsToEvictArgs } from '../caching/getStatementsToEvict';
import { getStatementsToEvict } from '../caching/getStatementsToEvict';
import { getDefinedSymbol, getStatementFromProgram } from '../utils';
import type { ReadOnlyVarNameToBlockMap } from '../internalTypes';

export type CacheContents = {
  result: IdentifiedResult;
  value?: ValueTypes.Value;
};

export class ComputationRealm {
  inferContext: language.TScopedInferContext;
  interpreterRealm: language.TScopedRealm;
  locCache = new Map<string, CacheContents>();
  errorLocs = new Set<string>();
  epoch = 0n;

  constructor(contextUtils: Partial<language.ContextUtils> = {}) {
    this.inferContext = makeInferContext({
      contextUtils,
    });
    this.interpreterRealm = new ScopedRealm(
      undefined,
      this.inferContext,
      'interpreter',
      {
        callValue: async (...args) =>
          functionCallValue(this.interpreterRealm, ...args),
      }
    );
  }

  setExternalData(externalData: ExternalDataMap) {
    this.interpreterRealm.setExternalData(externalData);
  }

  evictCache({ oldProgram, ...rest }: GetStatementsToEvictArgs) {
    for (const loc of this.errorLocs) {
      this.evictStatement(oldProgram, loc);
    }

    for (const blockId of getStatementsToEvict({ oldProgram, ...rest })) {
      this.evictStatement(oldProgram, blockId);
    }
  }

  evictStatement(program: ComputerProgram, blockId: string) {
    this.errorLocs.delete(blockId);
    this.locCache.delete(blockId);

    const statement = getStatementFromProgram(program, blockId);
    if (statement) {
      const sym = getDefinedSymbol(statement);
      if (sym) {
        this.interpreterRealm.stack.delete(sym);
        this.inferContext.stack.delete(sym);
        this.interpreterRealm.clearCacheForSymbols([sym]);
      }
    }
  }

  getFromCache(loc: string) {
    return this.locCache.get(loc) ?? null;
  }

  /** Retrieve labels (first column) for each table, indexed by table name. */
  async getIndexLabels(
    varNameToBlockMap: ReadOnlyVarNameToBlockMap = new Map()
  ): Promise<Map<string, string[]>> {
    const labels = new Map();

    const addLabels = async (
      _name: string,
      column?: ValueTypes.ColumnLikeValue,
      cellType?: language.Type
    ) => {
      if (!column || !cellType) {
        return;
      }
      const name = varNameToBlockMap.get(_name)?.definesVariable ?? _name;

      const data = getResultGenerator(await column.getData());

      if (cellType.type === 'string' || cellType.type === 'number') {
        // this is causing big performance problems.
        labels.set(name, await all(map(data(), String)));
      }

      const { date } = cellType;
      if (date) {
        labels.set(
          name,
          await all(
            map(data(), (d) =>
              Time.stringifyDate(
                d as bigint | number | symbol | undefined,
                date
              )
            )
          )
        );
      }
    };

    for (const [
      name,
      type,
    ] of this.inferContext.stack.globalVariables.entries()) {
      const tableOrColumn = this.interpreterRealm.stack.get(name);

      if (tableOrColumn instanceof Value.Table) {
        const tableType = this.inferContext.stack.get(name);
        if (tableType) {
          const [sortedTableType, sortedTableValue] = Value.sortValue(
            tableType,
            tableOrColumn
          );
          // eslint-disable-next-line no-await-in-loop
          await addLabels(
            name,
            sortedTableValue.columns[0],
            sortedTableType.columnTypes?.[0]
          );
        }
      } else if (tableOrColumn != null && Value.isColumnLike(tableOrColumn)) {
        // eslint-disable-next-line no-await-in-loop
        await addLabels(
          type.indexedBy ?? name,
          tableOrColumn,
          type.cellType ?? undefined
        );
      }
    }

    return labels;
  }

  addToCache(loc: string, result: CacheContents) {
    if (result.result?.result?.type?.kind !== 'type-error') {
      this.locCache.set(loc, result);
    } else {
      this.errorLocs.add(loc);
    }
  }
}
