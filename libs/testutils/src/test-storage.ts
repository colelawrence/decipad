import { ReplicaStorage } from '@decipad/interfaces';

export class TestStorage implements ReplicaStorage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
    global.dispatchEvent(new StorageEvent('storage', { key }));
  }

  getItem(key: string): string | null {
    const value = this.store.get(key);
    if (value == null) {
      return null;
    }
    return value;
  }

  removeItem(key: string): void {
    this.store.delete(key);
    global.dispatchEvent(new StorageEvent('storage', { key }));
  }

  clear(): void {
    this.store.clear();
  }

  key(n: number): string | null {
    const value = Array.from(this.store.keys())[n];
    if (value == null) {
      return null;
    }
    return value;
  }

  setReplicationStatus(): void {
    // do nothing
  }

  stop(): void {
    // do nothing
  }
}
