import { ExpressionCache } from './ExpressionCache';

describe('expression cache', () => {
  it('caches with no dependents', () => {
    const cache = new ExpressionCache<string>();
    cache.putCacheResult('key1', [], 'result1');
    expect(cache.getCacheResult('does not exist')).toBe(undefined);
    expect(cache.getCacheResult('key1')).toBe('result1');
  });

  it('caches with dependents', () => {
    const cache = new ExpressionCache<string>();
    cache.putCacheResult('key1', ['dep1', 'dep2'], 'result1');
    expect(cache.getCacheResult('key1')).toBe('result1');
    cache.clearCacheResultsForSymbols(['dep does not exist']);
    expect(cache.getCacheResult('key1')).toBe('result1');
    cache.clearCacheResultsForSymbols(['dep2']);
    expect(cache.getCacheResult('key1')).toBe(undefined);
  });

  it('uses parent cache', () => {
    const cache1 = new ExpressionCache<string>();
    cache1.putCacheResult('key1', [], 'result1');
    const cache2 = new ExpressionCache<string>(cache1);
    expect(cache2.getCacheResult('key does not exist')).toBe(undefined);
    expect(cache2.getCacheResult('key1')).toBe('result1');
  });
});
