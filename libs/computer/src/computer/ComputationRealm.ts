import {
  AST,
  ColumnLikeValue,
  ExternalDataMap,
  isColumnLike,
  makeContext as makeInferContext,
  Realm,
  stringifyDate,
  Table,
  Type,
  Value,
} from '@decipad/language';
import {
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from '../caching/getStatementsToEvict';
import type { IdentifiedResult } from '../types';
import { getDefinedSymbol, getStatement } from '../utils';

export type CacheContents = {
  result: IdentifiedResult;
  value?: Value;
};

export class ComputationRealm {
  inferContext = makeInferContext();
  interpreterRealm = new Realm(this.inferContext);
  locCache = new Map<string, CacheContents>();
  errorLocs = new Set<string>();

  setExternalData(externalData: ExternalDataMap) {
    this.interpreterRealm.externalData = externalData;
    this.inferContext.externalData = externalData;
  }

  evictCache({ oldBlocks, ...rest }: GetStatementsToEvictArgs) {
    for (const loc of this.errorLocs) {
      this.evictStatement(oldBlocks, loc);
    }

    for (const blockId of getStatementsToEvict({ oldBlocks, ...rest })) {
      this.evictStatement(oldBlocks, blockId);
    }
  }

  evictStatement(program: AST.Block[], blockId: string) {
    this.errorLocs.delete(blockId);
    this.locCache.delete(blockId);

    const sym = getDefinedSymbol(getStatement(program, blockId));
    if (sym) {
      this.interpreterRealm.stack.delete(sym, 'global');
      this.inferContext.stack.delete(sym, 'global');
      this.interpreterRealm.functions.delete(sym);
      this.interpreterRealm.clearCacheForSymbols([sym]);
      this.inferContext.functionDefinitions.delete(sym);
    }
  }

  getFromCache(loc: string) {
    return this.locCache.get(loc) ?? null;
  }

  /** Retrieve labels (first column) for each table, indexed by table name. */
  getIndexLabels(): Map<string, string[]> {
    const labels = new Map();

    const addLabels = (
      name: string,
      column?: ColumnLikeValue,
      cellType?: Type
    ) => {
      if (!column || !cellType) {
        return;
      }

      const data = column.getData();

      if (cellType.type === 'string' || cellType.type === 'number') {
        labels.set(
          name,
          (data as string[]).map((s) => String(s))
        );
      }

      const { date } = cellType;
      if (date) {
        labels.set(
          name,
          (data as Array<bigint | undefined | symbol>).map((d) =>
            stringifyDate(d, date)
          )
        );
      }
    };

    for (const [
      name,
      type,
    ] of this.inferContext.stack.globalVariables.entries()) {
      const table = this.interpreterRealm.stack.get(name, 'global');

      if (table instanceof Table) {
        addLabels(name, table.columns[0], type.columnTypes?.[0]);
      } else if (table != null && isColumnLike(table)) {
        addLabels(name, table, type.cellType ?? undefined);
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
