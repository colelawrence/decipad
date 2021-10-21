import { AST, Column, ExternalDataMap } from '..';
import { makeContext as makeInferContext } from '../infer';
import { Realm } from '../interpreter';

import {
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from './getStatementsToEvict';
import { InBlockResult, ValueLocation } from './types';
import {
  parseDefName,
  getDefinedSymbolAt,
  LocationSet,
  LocationMap,
} from './utils';

type CacheContents = InBlockResult | null;
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
        this.interpreterRealm.stack.delete(name);
        this.inferContext.stack.delete(name);
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
    const ret = new Map();

    for (const [name, type] of this.inferContext.stack.top.entries()) {
      if (type.indexName) {
        const table = this.interpreterRealm.stack.top.get(name);
        if (table instanceof Column && table.values[0] instanceof Column) {
          const labels = table.values[0].getData();
          if (typeof labels[0] === 'string') {
            ret.set(name, labels as string[]);
          }
        }
      }
    }

    return ret;
  }

  addToCache(loc: ValueLocation, result: CacheContents) {
    if (result?.valueType?.errorCause == null) {
      this.locCache.set(loc, result);
    } else {
      this.errorLocs.add(loc);
    }
  }
}
