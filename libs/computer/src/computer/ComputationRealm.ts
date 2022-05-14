import {
  AST,
  Table,
  ExternalDataMap,
  Type,
  makeContext as makeInferContext,
  Realm,
  Value,
  ColumnLike,
  isColumnLike,
  stringifyDate,
} from '@decipad/language';

import {
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from '../caching/getStatementsToEvict';
import { InBlockResult, ValueLocation } from '../types';
import {
  parseDefName,
  getDefinedSymbolAt,
  LocationSet,
  LocationMap,
} from '../utils';

export type CacheContents = {
  result: InBlockResult | null;
  value: Value | undefined;
};
export class ComputationRealm {
  inferContext = makeInferContext();
  interpreterRealm = new Realm(this.inferContext);
  locCache = new LocationMap<CacheContents>();
  errorLocs = new LocationSet();

  setExternalData(externalData: ExternalDataMap) {
    this.interpreterRealm.externalData = externalData;
    this.inferContext.externalData = externalData;
  }

  evictCache({ oldBlocks, ...rest }: GetStatementsToEvictArgs) {
    for (const loc of this.errorLocs) {
      this.evictStatement(oldBlocks, loc);
    }

    const statementsToEvict = getStatementsToEvict({ oldBlocks, ...rest });

    for (const loc of statementsToEvict) {
      this.evictStatement(oldBlocks, loc);
    }
  }

  evictStatement(program: AST.Block[], loc: ValueLocation) {
    this.errorLocs.delete(loc);
    this.locCache.delete(loc);

    const sym = getDefinedSymbolAt(program, loc);
    if (sym) {
      const [type, name] = parseDefName(sym);

      if (type === 'var') {
        this.interpreterRealm.stack.globalVariables.delete(name);
        this.inferContext.stack.globalVariables.delete(name);
      } else {
        this.interpreterRealm.functions.delete(name);
        this.inferContext.functionDefinitions.delete(name);
      }
    }
  }

  getFromCache(loc: ValueLocation) {
    return this.locCache.get(loc) ?? null;
  }

  /** Retrieve labels (first column) for each table, indexed by table name. */
  getIndexLabels(): Map<string, string[]> {
    const labels = new Map();

    const addLabels = (name: string, column?: ColumnLike, cellType?: Type) => {
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
          (data as bigint[]).map((d) => stringifyDate(d, date))
        );
      }
    };

    for (const [
      name,
      type,
    ] of this.inferContext.stack.globalVariables.entries()) {
      const table = this.interpreterRealm.stack.globalVariables.get(name);

      if (table instanceof Table) {
        addLabels(name, table.columns[0], type.columnTypes?.[0]);
      } else if (table != null && isColumnLike(table)) {
        addLabels(name, table, type.cellType ?? undefined);
      }
    }

    return labels;
  }

  addToCache(loc: ValueLocation, result: CacheContents) {
    if (result.result?.type?.kind !== 'type-error') {
      this.locCache.set(loc, result);
    } else {
      this.errorLocs.add(loc);
    }
  }
}
