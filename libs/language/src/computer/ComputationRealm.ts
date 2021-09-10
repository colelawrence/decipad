import { AST, ExternalDataMap } from '..';
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
  interpreterRealm = new Realm();
  inferContext = makeInferContext();
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

  addToCache(loc: ValueLocation, result: CacheContents) {
    if (result?.valueType?.errorCause == null) {
      this.locCache.set(loc, result);
    } else {
      this.errorLocs.add(loc);
    }
  }
}
