import { Buffer } from 'buffer';
import {
  encodeStateAsUpdate,
  applyUpdate,
  Doc as YDoc,
  mergeUpdates,
} from 'yjs';
import { Observable } from 'lib0/observable';
import { noop } from '@decipad/utils';
import { fnQueue } from '@decipad/fnqueue';
import tables, { allPages } from '@decipad/services/tables';
import { DocSyncRecord } from '@decipad/backendtypes';

export class DynamodbPersistence extends Observable<string> {
  public db: IDBDatabase | null = null;
  public doc: YDoc;
  public name: string;
  public synced = false;
  public whenSynced: Promise<DynamodbPersistence>;

  private _mux = fnQueue();
  private _readOnly: boolean;

  constructor(name: string, doc: YDoc, readOnly = false) {
    super();
    this.doc = doc;
    this.name = name;
    this._readOnly = readOnly;
    this.whenSynced = this._init();
    this.destroy = this.destroy.bind(this);
    doc.on('destroy', this.destroy);
  }

  private async _init(): Promise<DynamodbPersistence> {
    const currState = encodeStateAsUpdate(this.doc);
    await this._fetchUpdates();
    const data = await tables();
    await data.docsync.withLock(
      this.name,
      async (
        docsync = { id: this.name, _version: 0, data: '' }
      ): Promise<DocSyncRecord> => {
        return {
          id: docsync.id,
          _version: docsync._version + 1,
          data: Buffer.from(currState).toString('base64'),
        };
      }
    );
    this.synced = true;
    return this;
  }

  private async _fetchUpdates(): Promise<void> {
    return this._mux.push(async () => {
      const data = await tables();
      const updates: Uint8Array[] = [];
      for await (const docsyncUpdate of allPages(data.docsyncupdates, {
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': this.name,
        },
      })) {
        if (docsyncUpdate) {
          updates.push(Buffer.from(docsyncUpdate.data, 'base64'));
        }
      }

      this.doc.transact(() =>
        updates.forEach((val) =>
          applyUpdate(this.doc, val, DynamodbPersistence)
        )
      );

      this.emit('fetched', [this]);
    });
  }

  async storeUpdate(update: Uint8Array, origin: unknown): Promise<void> {
    if (this._readOnly || origin === DynamodbPersistence) {
      return;
    }
    await this._mux.push(async () => {
      await this.whenSynced;
      const data = await tables();
      await data.docsyncupdates.put(
        {
          id: this.name,
          seq: `${Date.now()}:${Math.floor(Math.random() * 10000)}`,
          data: Buffer.from(update).toString('base64'),
        },
        true
      );
      this.emit('saved', [this]);
    });
  }

  async compact(): Promise<void> {
    if (this._readOnly) {
      return;
    }
    await this.whenSynced;
    const data = await tables();
    const updates = (
      await data.docsyncupdates.query({
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': this.name,
        },
      })
    ).Items;
    if (updates.length > 1) {
      await this.storeUpdate(
        mergeUpdates(updates.map((u) => Buffer.from(u.data, 'base64'))),
        'compaction'
      );
      await Promise.all(
        updates.map((update) =>
          data.docsyncupdates.delete({ id: update.id, seq: update.seq }, true)
        )
      );
    }
  }

  flush(): Promise<void> {
    return this._mux.flush().then(noop);
  }

  async destroy(): Promise<void> {
    this.doc.off('destroy', this.destroy);
  }
}
