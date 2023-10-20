import {
  ColumnLikeValue,
  ExternalDataMap,
  isColumnLike,
  makeContext as makeInferContext,
  Realm,
  sortValue,
  stringifyDate,
  Table,
  Type,
  Value,
} from '@decipad/language';
import { all, map } from '@decipad/generator-utils';
import {
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from '../caching/getStatementsToEvict';
import type { ComputerProgram, IdentifiedResult } from '../types';
import { getDefinedSymbol, getStatementFromProgram } from '../utils';
import { getResultGenerator } from '../utils/getResultGenerator';
import { createComputerStats } from './computerStats';
import { ReadOnlyVarNameToBlockMap } from '../internalTypes';

export type CacheContents = {
  result: IdentifiedResult;
  value?: Value;
};

export class ComputationRealm {
  inferContext = makeInferContext();
  interpreterRealm = new Realm(this.inferContext);
  locCache = new Map<string, CacheContents>();
  errorLocs = new Set<string>();
  epoch = 0n;
  stats = createComputerStats(this.inferContext, this.interpreterRealm);

  setExternalData(externalData: ExternalDataMap) {
    this.interpreterRealm.externalData = externalData;
    this.inferContext.externalData = externalData;
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
        this.interpreterRealm.stack.delete(sym, 'global');
        this.inferContext.stack.delete(sym, 'global');
        this.interpreterRealm.functions.delete(sym);
        this.interpreterRealm.clearCacheForSymbols([sym]);
        this.inferContext.functionDefinitions.delete(sym);
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
      column?: ColumnLikeValue,
      cellType?: Type
    ) => {
      if (!column || !cellType) {
        return;
      }
      const name = varNameToBlockMap.get(_name)?.definesVariable ?? _name;

      const data = getResultGenerator(await column.getData());

      if (cellType.type === 'string' || cellType.type === 'number') {
        labels.set(name, await all(map(data(), String)));
      }

      const { date } = cellType;
      if (date) {
        labels.set(
          name,
          await all(
            map(data(), (d) =>
              stringifyDate(d as bigint | number | symbol | undefined, date)
            )
          )
        );
      }
    };

    for (const [
      name,
      type,
    ] of this.inferContext.stack.globalVariables.entries()) {
      const tableOrColumn = this.interpreterRealm.stack.get(name, 'global');

      if (tableOrColumn instanceof Table) {
        const tableType = this.inferContext.stack.get(name, 'global');
        if (tableType) {
          const [sortedTableType, sortedTableValue] = sortValue(
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
      } else if (tableOrColumn != null && isColumnLike(tableOrColumn)) {
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
