import { makeContext as makeInferContext } from '../infer';
import { Realm } from '../interpreter';
import { getAllBlockLocations, getDependents } from './dependencies';
import { ParseRet } from './parse';
import { InBlockResult, ValueLocation } from './types';
import {
  parseDefName,
  getDefinedSymbolAt,
  getGoodBlocks,
  stringifyLoc,
} from './utils';

export interface IComputationRealm {
  interpreterRealm: Realm;
  inferContext: ReturnType<typeof makeInferContext>;

  evictBlockCache(oldParseRet: ParseRet[], toEvict: string[]): void;

  has(defName: string): boolean;
  delete(defName: string): void;

  hasLoc(loc: ValueLocation): boolean;
  addLocToCache(loc: ValueLocation, r: InBlockResult): void;
}

export class ComputationRealm implements IComputationRealm {
  interpreterRealm = new Realm();
  inferContext = makeInferContext();
  locCache = new Map<string, InBlockResult>();

  evictBlockCache(oldParseRet: ParseRet[], toEvict: string[]) {
    const program = getGoodBlocks(oldParseRet);

    const allLocsToClear = [
      ...getAllBlockLocations(program, toEvict),
      ...getDependents(program, toEvict),
    ];

    for (const loc of allLocsToClear) {
      this.locCache.delete(stringifyLoc(loc));

      const sym = getDefinedSymbolAt(program, loc);
      if (sym) {
        this.delete(sym);
      }
    }
  }

  has(defName: string) {
    const [type, name] = parseDefName(defName);

    return type === 'var'
      ? this.inferContext.stack.has(name)
      : this.inferContext.functionDefinitions.has(name);
  }

  delete(defName: string) {
    const [type, name] = parseDefName(defName);

    if (type === 'var') {
      this.interpreterRealm.stack.delete(name);
      this.inferContext.stack.delete(name);
    } else {
      this.interpreterRealm.functions.delete(name);
      this.inferContext.functionDefinitions.delete(name);
    }
  }

  hasLoc(loc: ValueLocation) {
    return this.locCache.has(stringifyLoc(loc));
  }

  addLocToCache(loc: ValueLocation, value: InBlockResult) {
    this.locCache.set(stringifyLoc(loc), value);
  }
}

/* istanbul ignore next */
export class TestComputationRealm implements IComputationRealm {
  interpreterRealm = new Realm();
  inferContext = makeInferContext();
  cache: Set<string>;
  locCache: Set<string>;

  constructor(cacheContents: string[], cachedLocs: ValueLocation[]) {
    this.cache = new Set(cacheContents);
    this.locCache = new Set(cachedLocs.map(stringifyLoc));
  }

  evictBlockCache() {
    throw new Error('not implemented in the mock');
  }

  has = (sym: string) => this.cache.has(sym);
  delete = (sym: string) => this.cache.delete(sym);

  hasLoc = (loc: ValueLocation) => this.locCache.has(stringifyLoc(loc));
  addLocToCache = () => {};
}
