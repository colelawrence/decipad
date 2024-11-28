/* eslint-disable no-console */
import { Buffer } from 'buffer';
import type { Doc as YDoc } from 'yjs';
import { applyUpdate } from 'yjs';
import { Observable } from 'lib0/observable';
import { getDefined, getDefinedPromise, noop } from '@decipad/utils';
import { fnQueue } from '@decipad/fnqueue';
import { getStoredSnapshotUpdate } from './snapshot';
import { getAllUpdates } from '../pad-content/updates';
import { createUpdate } from '../pad-content/createUpdate';
import { compact } from '../pad-content/compact';

const DYNAMODB_PERSISTENCE_ORIGIN = 'ddb';

interface DynamodbPersistenceOptions {
  saveOnUpdate?: boolean;
}

export class DynamodbPersistence extends Observable<string> {
  public db: IDBDatabase | null = null;
  public doc: YDoc;
  public name: string;
  public synced = false;
  public whenSynced: Promise<DynamodbPersistence>;
  public version?: string;

  private _mux = fnQueue();
  private _readOnly: boolean;
  private _pendingSaves = 0;

  constructor(
    name: string,
    doc: YDoc,
    version?: string,
    readOnly = false,
    options: DynamodbPersistenceOptions = {}
  ) {
    super();
    this.doc = doc;
    this.name = name;
    this._readOnly = readOnly;
    this.version = version;
    this.whenSynced = this._init();
    this.destroy = this.destroy.bind(this);
    doc.on('destroy', this.destroy);
    this._onUpdate = this._onUpdate.bind(this);
    if (options.saveOnUpdate) {
      doc.on('update', this._onUpdate);
    }
  }

  private async _init(): Promise<DynamodbPersistence> {
    await this._fetchAndProcessUpdates();
    this.synced = true;
    return this;
  }

  private _fetchAndProcessUpdates(): Promise<void> {
    return this._mux.push(async () => {
      const updates = await (this.version
        ? this._fetchSnapshot()
        : this._fetchUpdates());

      this._processUpdates(updates);
    });
  }

  private async _fetchSnapshot(): Promise<Uint8Array[]> {
    return getDefinedPromise(
      getStoredSnapshotUpdate(this.name, getDefined(this.version))
    );
  }

  private async _fetchUpdates(): Promise<Uint8Array[]> {
    return getAllUpdates(this.name);
  }

  private _processUpdates(updates: Uint8Array[]): void {
    this.doc.transact(() =>
      updates
        .filter(Boolean) // make sure we don't have any sneaky undefineds
        .filter((buf) => Buffer.isBuffer(buf)) // make sure we only have buffers
        .filter((buf) => buf.length > 0) // make sure we only have non-empty
        .forEach((val) => {
          try {
            applyUpdate(this.doc, val, DYNAMODB_PERSISTENCE_ORIGIN);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Error applying update ${val}`, err);
          }
        })
    );

    this.emit('fetched', [this]);
  }

  async storeUpdate(
    update: Uint8Array,
    origin: unknown,
    skipNotif = false
  ): Promise<void> {
    if (
      this._readOnly ||
      this.version ||
      origin === DYNAMODB_PERSISTENCE_ORIGIN
    ) {
      return;
    }
    this._pendingSaves += 1;
    await this._mux.push(async () => {
      try {
        await this.whenSynced;
        await createUpdate(this.name, update, skipNotif ? false : 0.1);
        this.emit('saved', [this]);
      } finally {
        this._pendingSaves -= 1;
        if (this._pendingSaves === 0) {
          this.emit('flushed', [this]);
        }
      }
    });
  }

  _onUpdate(update: Uint8Array, origin: unknown) {
    if (origin !== DYNAMODB_PERSISTENCE_ORIGIN) {
      this.storeUpdate(update, origin);
    }
  }

  async compact(): Promise<void> {
    if (this._readOnly || this.version) {
      return;
    }
    await this.whenSynced;
    await compact(this.name);
  }

  flush(): Promise<void> {
    return this._mux.flush().then(noop);
  }

  destroy() {
    this.doc.off('destroy', this.destroy);
    this.doc.off('update', this._onUpdate);
  }
}
