import type {
  ExternalDataMap,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type * as language from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import {
  makeInferContext,
  ScopedRealm,
  functionCallValue,
} from '@decipad/language';
import type {
  ComputerProgram,
  IdentifiedResult,
} from '@decipad/computer-interfaces';
import type { GetStatementsToEvictArgs } from '../caching/getStatementsToEvict';
import { getStatementsToEvict } from '../caching/getStatementsToEvict';
import { getDefinedSymbol, getStatementFromProgram } from '../utils';

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

  addToCache(loc: string, result: CacheContents) {
    if (result.result?.result?.type?.kind !== 'type-error') {
      this.locCache.set(loc, result);
    } else {
      this.errorLocs.add(loc);
    }
  }
}
