import { timeout, TestStorage, LimitedTestStorage } from '@decipad/testutils';
import { ReplicationStatus } from '@decipad/interfaces';
import { LRUStorage } from './lru-storage';

const exceededQuotaExceptionGenerators = [
  () => ({ code: 22 }),
  () => ({ code: 1014 }),
  () => ({ name: 'QuotaExceededError' }),
  () => ({ name: 'NS_ERROR_DOM_QUOTA_REACHED' }),
];

describe('LRU Storage', () => {
  it('can be constructed from another store', () => {
    const s1 = new LRUStorage(new TestStorage());
    const s2 = new LRUStorage(new TestStorage());

    s1.setItem('key', 'value1');
    s2.setItem('key', 'value2');
    expect(s1.getItem('key')).toBe('value1');
    expect(s2.getItem('key')).toBe('value2');
  });

  it('can be cleared and enumerated', () => {
    const s = new LRUStorage(new TestStorage());
    s.setItem('key', 'value');
    expect(s.length).toBe(1); // metadata
    expect(s.key(0)).toBe('key');
    s.clear();
    expect(s.length).toBe(0);
  });

  it.each(exceededQuotaExceptionGenerators)(
    'handles storage exceeded exception %# by removing older elements that have been replicated',
    async (getQuotaExceededException) => {
      const ls = new LimitedTestStorage({
        itemCountLimit: 2,
        getQuotaExceededException,
      });
      const s = new LRUStorage(ls);

      s.setItem('k1', 'v1');
      s.setReplicationStatus('k1', ReplicationStatus.SavedRemotely);
      await timeout(50);
      s.setItem('k2', 'v2');
      s.setReplicationStatus('k2', ReplicationStatus.SavedRemotely);
      await timeout(50);
      s.setItem('k3', 'v3');
      s.setReplicationStatus('k3', ReplicationStatus.SavedRemotely);

      expect(s.getItem('k1')).toBe(null);
      expect(s.getItem('k2')).toBe('v2');
      expect(s.getItem('k3')).toBe('v3');

      await timeout(50);
      s.setItem('k1', 'v1');
      expect(s.getItem('k1')).toBe('v1');
      expect(s.getItem('k2')).toBe(null);
      expect(s.getItem('k3')).toBe('v3');

      // test that LRU does not evict if we haven't set the replication status
      s.setItem('k4', 'v4');
      s.setItem('k4', 'v4'); // ok because it's a key that already exists
      expect(() => s.setItem('k5', 'v5')).toThrow();

      // removing an element makes space for a new one
      s.removeItem('k4');
      s.setItem('k5', 'v5');

      s.stop();
    }
  );
});
