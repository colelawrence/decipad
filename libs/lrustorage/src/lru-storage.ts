import debounce from 'lodash.debounce';
import { ReplicationStatus, ReplicaStorage } from '@decipad/interfaces';

type InternalItemMetadata = [savedAt: number, savedRemotely: boolean];
interface ItemMetadata {
  savedAt?: number;
  savedRemotely?: boolean;
}

const metaKeyStarter = '@m';
const defaultOptions = {
  debouceFlushMetadataMs: 2000,
};

function isStorageExceededException(err: DOMException): boolean {
  return (
    // everything except Firefox
    err.code === 22 ||
    // Firefox
    err.code === 1014 ||
    // test name field too, because code might not be present
    // everything except Firefox
    err.name === 'QuotaExceededError' ||
    // Firefox
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

function timestamp() {
  return Date.now();
}

function metadataKey(key: string): string {
  return metaKeyStarter + key;
}

export class LRUStorage implements ReplicaStorage {
  private store: Storage;
  private keyStatuses: Map<string, ItemMetadata> = new Map();
  private debouncedFlushMetadata: {
    cancel: () => void;
    (): void;
  };

  constructor(extendsStore: Storage, options = defaultOptions) {
    this.store = extendsStore;
    this.debouncedFlushMetadata = debounce(
      this.flushMetadata.bind(this),
      options.debouceFlushMetadataMs
    );
  }

  get length(): number {
    return this.store.length;
  }

  setItem(key: string, value: string): void {
    try {
      this.unsafeSetItem(key, value);
    } catch (err) {
      if (isStorageExceededException(err) && this.tryClearStorage()) {
        this.setItem(key, value);
        return;
      }
      throw err;
    }
  }

  getItem(key: string): string | null {
    return this.store.getItem(key);
  }

  removeItem(key: string): void {
    this.store.removeItem(key);
    this.removeMetadata(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(n: number): string | null {
    return this.store.key(n);
  }

  setReplicationStatus(key: string, status: ReplicationStatus): void {
    const meta = this.getMetadata(key);
    if (meta) {
      const savedRemotely = status === ReplicationStatus.SavedRemotely;
      this.mergeMetadata(key, { savedRemotely });
    }
  }

  stop(): void {
    this.flushMetadata();
  }

  private unsafeSetItem(key: string, value: string) {
    this.store.setItem(key, value);
    this.mergeMetadata(key, { savedAt: timestamp() });
  }

  private tryClearStorage(): boolean {
    const evictKey = this.getOldestKey();
    if (evictKey) {
      this.removeItem(evictKey);
      return true;
    }
    return false;
  }

  private getOldestKey(): string | null {
    // scan the whole of internal storeage keys to get the oldest key
    // not the fastest of algorithms, but it should do the trick.

    let oldestKey: null | string = null;
    let oldestTimestamp = timestamp();

    const maybeKey = (key: string) => {
      if (key && !key.startsWith(metaKeyStarter)) {
        const meta = this.getMetadata(key);
        if (meta) {
          const { savedAt, savedRemotely = false } = meta;
          if (savedRemotely && savedAt && savedAt < oldestTimestamp) {
            oldestKey = key;
            oldestTimestamp = savedAt;
          }
        }
      }
    };

    for (const key of this.keyStatuses.keys()) {
      maybeKey(key);
    }

    for (let i = 0; i < this.store.length; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      maybeKey(this.store.key(i)!);
    }
    return oldestKey;
  }

  private mergeMetadata(key: string, metadata: ItemMetadata) {
    const m = this.getMetadata(key) || {};
    this.saveMetadata(key, { ...m, ...metadata });
  }

  private flushMetadata() {
    try {
      const pendingKeys = this.keyStatuses.keys();
      for (const key of pendingKeys) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const metadata = this.getMetadata(key)!;
        this.store.setItem(
          metadataKey(key),
          JSON.stringify([metadata.savedAt, metadata.savedRemotely])
        );
      }
      this.keyStatuses.clear();
      this.debouncedFlushMetadata.cancel();
    } catch (err) {
      // do nothing
    }
  }

  private saveMetadata(key: string, metadata: ItemMetadata) {
    this.keyStatuses.set(key, metadata);
    this.debouncedFlushMetadata();
  }

  private getMetadata(key: string): ItemMetadata | null {
    const savedMetadata = this.getSavedMetadata(key);
    const inMemMetadata = this.keyStatuses.get(key);
    if (!savedMetadata && !inMemMetadata) {
      return null;
    }
    const metadata = { ...(savedMetadata || {}), ...(inMemMetadata || {}) };
    return metadata;
  }

  private getSavedMetadata(key: string): ItemMetadata | null {
    const m = this.getItem(metadataKey(key));
    const metadata = m ? (JSON.parse(m) as InternalItemMetadata) : null;
    if (metadata !== null) {
      return {
        savedAt: metadata[0],
        savedRemotely: metadata[1] || false,
      };
    }
    return null;
  }

  private removeMetadata(key: string) {
    this.keyStatuses.delete(key);
    this.store.removeItem(metadataKey(key));
  }
}
