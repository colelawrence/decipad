export class TestStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
    global.dispatchEvent(new StorageEvent('storage', { key }));
  }

  getItem(key: string) {
    const value = this.store.get(key);
    if (value == null) {
      return null;
    }
    return value;
  }

  removeItem(key: string) {
    this.store.delete(key);
    global.dispatchEvent(new StorageEvent('storage', { key }));
  }

  clear() {
    this.store.clear();
  }

  key (n: number): string | null {
    const value = Array.from(this.store.values())[n];
    if (value == null) {
      return null;
    }
    return value;
  }
}