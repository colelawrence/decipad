export class ExpressionCache<T> {
  private parentCache: ExpressionCache<T> | undefined;
  private cache = new Map<string, T>();
  private cacheKeysDependentsForSymbol = new Map<string, string[]>();

  constructor(parentCache?: ExpressionCache<T>) {
    this.parentCache = parentCache;
  }

  putCacheResult(key: string, dependentsForSymbols: string[], result: T): void {
    for (const symbol of dependentsForSymbols) {
      let dependents = this.cacheKeysDependentsForSymbol.get(symbol);
      if (!dependents) {
        dependents = [];
        this.cacheKeysDependentsForSymbol.set(symbol, dependents);
      }
      dependents.push(key);
    }
    this.cache.set(key, result);
  }

  getCacheResult(key: string): T | undefined {
    const result = this.cache.get(key);
    if (result == null && this.parentCache) {
      return this.parentCache.getCacheResult(key);
    }
    return result;
  }

  clearCacheResultsForSymbols(symbols: string[]): void {
    for (const symbol of symbols) {
      const dependentKeys = this.cacheKeysDependentsForSymbol.get(symbol);
      if (dependentKeys) {
        for (const dependentKey of dependentKeys) {
          this.cache.delete(dependentKey);
        }
      }
    }
    if (this.parentCache) {
      this.parentCache.clearCacheResultsForSymbols(symbols);
    }
  }
}
