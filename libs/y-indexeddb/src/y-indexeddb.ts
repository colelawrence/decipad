import * as Y from 'yjs';
import * as idb from 'lib0/indexeddb';
import { Observable } from 'lib0/observable';
import { getDefined } from '@decipad/utils';
import { fnQueue } from '@decipad/fnqueue';

export const updatesStoreName = 'updates';
export const versionsStoreName = 'versions';

export const PREFERRED_TRIM_SIZE = 500;

export async function fetchUpdates(
  idbPersistence: IndexeddbPersistence
): Promise<void> {
  return idbPersistence._mux.push(async () => {
    await maybeWithStore(idbPersistence, false, async (store) => {
      const updates = await idb.getAll(
        store,
        idb.createIDBKeyRangeLowerBound(idbPersistence._dbref, false)
      );

      if (idbPersistence._destroyed) {
        return;
      }

      idbPersistence.doc.transact(() =>
        updates.forEach((val) => Y.applyUpdate(idbPersistence.doc, val))
      );

      await maybeWithStore(idbPersistence, false, async (store2) => {
        const lastKey = await idb.getLastKey(store2);
        // eslint-disable-next-line no-param-reassign
        idbPersistence._dbref = lastKey + 1;
        await maybeWithStore(idbPersistence, false, async (store3) => {
          const cnt = await idb.count(store3);
          // eslint-disable-next-line no-param-reassign
          idbPersistence._dbsize = cnt;
        });
      });
    });
  });
}

function getUpdatesStore(
  idbPersistence: IndexeddbPersistence,
  write = false
): IDBObjectStore | null {
  try {
    const [updatesStore] = idb.transact(
      getDefined(idbPersistence.db),
      [updatesStoreName],
      write ? 'readwrite' : 'readonly'
    );
    return updatesStore;
  } catch (err) {
    if ((err as Error).name === 'InvalidStateError') {
      return null;
    }
    throw err;
  }
}

function getVersionsStore(
  idbPersistence: IndexeddbPersistence,
  write = false
): IDBObjectStore | null {
  try {
    const [versionsStore] = idb.transact(
      getDefined(idbPersistence.db),
      [updatesStoreName],
      write ? 'readwrite' : 'readonly'
    );
    return versionsStore;
  } catch (err) {
    if ((err as Error).name === 'InvalidStateError') {
      return null;
    }
    throw err;
  }
}

async function maybeWithStore<T>(
  idbPersistence: IndexeddbPersistence,
  write: boolean,
  fn: (store: IDBObjectStore) => Promise<T> | void
): Promise<T | void> {
  if (idbPersistence._destroyed) {
    return;
  }
  const store = getUpdatesStore(idbPersistence, write);
  if (store) {
    return fn(store);
  }
}

export async function storeState(
  idbPersistence: IndexeddbPersistence,
  forceStore = true
): Promise<void> {
  await fetchUpdates(idbPersistence);

  if (forceStore || idbPersistence._dbsize >= PREFERRED_TRIM_SIZE) {
    await maybeWithStore(idbPersistence, true, async (store) => {
      await idb.addAutoKey(store, Y.encodeStateAsUpdate(idbPersistence.doc));
      idbPersistence.emit('saved', [idbPersistence]);
      await maybeWithStore(idbPersistence, true, async (store2) => {
        await idb.del(
          store2,
          idb.createIDBKeyRangeUpperBound(idbPersistence._dbref, true)
        );
        await maybeWithStore(idbPersistence, false, async (store3) => {
          // eslint-disable-next-line no-param-reassign
          idbPersistence._dbsize = await idb.count(store3);
        });
      });
    });
  }
}

export async function clearDocument(name: string): Promise<void> {
  await idb.deleteDB(name);
}

interface DocumentVersion {
  name: string;
  version: string;
  createdAt: number;
}

interface IndexeddbPersistenceOptions {
  readOnly?: boolean;
}

export class IndexeddbPersistence extends Observable<string> {
  public db: IDBDatabase | null = null;
  public doc: Y.Doc;
  public name: string;
  public synced = false;
  public whenSynced: Promise<IndexeddbPersistence>;

  public _dbref = 0;
  public _dbsize = 0;
  public _mux = fnQueue();
  public _destroyed = false;

  private _db: Promise<IDBDatabase>;
  private _storeTimeoutId: ReturnType<typeof setTimeout> | undefined;
  /**
   * Timeout in ms untill data is merged and persisted in idb.
   */
  private _storeTimeout = 1000;

  constructor(
    name: string,
    doc: Y.Doc,
    { readOnly = false }: IndexeddbPersistenceOptions = {}
  ) {
    super();
    this.doc = doc;
    this.name = readOnly ? `${name}:readonly` : name;
    this._db = idb.openDB(this.name, (db) =>
      idb.createStores(db, [['updates', { autoIncrement: true }]])
    );
    this.whenSynced = this._init();
    this._storeUpdate = this._storeUpdate.bind(this);
    this.destroy = this.destroy.bind(this);
    doc.on('update', this._storeUpdate);
    doc.on('destroy', this.destroy);
  }

  private async _init(): Promise<IndexeddbPersistence> {
    this.db = await this._db;
    const currState = Y.encodeStateAsUpdate(this.doc);
    await fetchUpdates(this);
    return maybeWithStore(
      this,
      true,
      async (store): Promise<IndexeddbPersistence> => {
        await idb.addAutoKey(store, currState);
        return this;
      }
    ).then((store) => {
      if (!this._destroyed) {
        this.emit('synced', [this]);
        this.synced = true;
      }
      return new Promise((resolve) => {
        if (store) {
          resolve(store);
        }
      });
    });
  }

  private async _storeUpdate(
    update: Uint8Array,
    _origin: unknown,
    _doc: Y.Doc,
    tr: Y.Transaction
  ) {
    await this._mux.push(async () => {
      await this.whenSynced;
      await maybeWithStore(this, true, async (store) => {
        await idb.addAutoKey(store, update);
        this.emit('saved', [this, tr.local]);
        this._dbsize += 1;
        if (this._dbsize >= PREFERRED_TRIM_SIZE) {
          // debounce store call
          if (this._storeTimeoutId) {
            clearTimeout(this._storeTimeoutId);
          }
          this._storeTimeoutId = setTimeout(async () => {
            await storeState(this, false);
            this._storeTimeoutId = undefined;
          }, this._storeTimeout);
        }
      });
    });
  }

  async destroy(): Promise<void> {
    this._destroyed = true;
    if (this._storeTimeoutId) {
      clearTimeout(this._storeTimeoutId);
    }
    this.doc.off('update', this._storeUpdate);
    this.doc.off('destroy', this.destroy);
    const db = await this._db;
    await db.close();
  }

  async remove(): Promise<void> {
    await maybeWithStore(this, true, async (store) => {
      store.clear();
    });
  }

  async markVersion(versionName: string): Promise<void> {
    const versionsStore = getDefined(getVersionsStore(this, true));
    const version: DocumentVersion = {
      name: versionName,
      version: Buffer.from(Y.encodeStateVector(this.doc)).toString('hex'),
      createdAt: Date.now(),
    };
    await idb.add(versionsStore, JSON.stringify(version), versionName);
  }

  async sameVersion(versionName: string): Promise<boolean> {
    const versionsStore = getDefined(getVersionsStore(this, false));
    const versionString = await idb.get(versionsStore, versionName);
    if (versionString && typeof versionString === 'string') {
      const version = JSON.parse(versionString);
      const currentVersion = Buffer.from(
        Y.encodeStateVector(this.doc)
      ).toString('hex');
      return version.version !== currentVersion;
    }
    return false;
  }
}
