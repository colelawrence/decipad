interface ITestStorageOptions {
  itemCountLimit: number;
  getQuotaExceededException: () => any;
}

export class LimitedTestStorage implements Storage {
  private store = new Map<string, string>();
  private options: ITestStorageOptions;

  constructor(options: ITestStorageOptions) {
    this.options = options;
  }

  get length(): number {
    return this.store.size;
  }

  setItem(key: string, value: string) {
    if (
      !this.store.has(key) &&
      this.store.size >= this.options.itemCountLimit
    ) {
      throw this.options.getQuotaExceededException();
    }
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

  key(n: number): string | null {
    const value = Array.from(this.store.keys())[n];
    if (value == null) {
      return null;
    }
    return value;
  }
}
