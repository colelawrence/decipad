import { Buffer } from 'buffer';
import {
  encodeStateAsUpdate,
  applyUpdate,
  Doc as YDoc,
  mergeUpdates,
} from 'yjs';
import { Observable } from 'lib0/observable';
import { getDefined, noop } from '@decipad/utils';
import { fnQueue } from '@decipad/fnqueue';
import { DocSyncRecord, DocSyncUpdateRecord } from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/tables';
import { nanoid } from 'nanoid';

const DYNAMODB_PERSISTENCE_ORIGIN = 'ddb';
const MAX_ALLOWED_RECORD_SIZE_BYTES = 350_000;

export class DynamodbPersistence extends Observable<string> {
  public db: IDBDatabase | null = null;
  public doc: YDoc;
  public name: string;
  public synced = false;
  public whenSynced: Promise<DynamodbPersistence>;
  public version?: string;

  private _mux = fnQueue();
  private _readOnly: boolean;

  constructor(name: string, doc: YDoc, version?: string, readOnly = false) {
    super();
    this.doc = doc;
    this.name = name;
    this._readOnly = readOnly;
    this.version = version;
    this.whenSynced = this._init();
    this.destroy = this.destroy.bind(this);
    doc.on('destroy', this.destroy);
  }

  private async _init(): Promise<DynamodbPersistence> {
    const currState = encodeStateAsUpdate(this.doc);
    await this._fetchAndProcessUpdates();
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

  private _fetchAndProcessUpdates(): Promise<void> {
    return this._mux.push(async () => {
      const updates = await (this.version
        ? this._fetchSnapshot()
        : this._fetchUpdates());

      this._processUpdates(updates);
    });
  }

  private async _fetchSnapshot(): Promise<Uint8Array[]> {
    const data = await tables();
    const updates: Uint8Array[] = [];
    for await (const snapshot of allPages(data.docsyncsnapshots, {
      IndexName: 'byDocsyncIdAndName',
      KeyConditionExpression: 'docsync_id = :docsync_id AND name = :name',
      ExpressionAttributeValues: {
        ':docsync_id': this.name,
        ':name': getDefined(this.version),
      },
    })) {
      if (snapshot && snapshot.data) {
        updates.push(Buffer.from(snapshot.data, 'base64'));
      }
    }
    return updates;
  }

  private async _fetchUpdates(): Promise<Uint8Array[]> {
    const data = await tables();
    const updates: Uint8Array[] = [];
    for await (const docsyncUpdate of allPages(data.docsyncupdates, {
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': this.name,
      },
    })) {
      if (docsyncUpdate && docsyncUpdate.data) {
        updates.push(Buffer.from(docsyncUpdate.data, 'base64'));
      }
    }
    return updates;
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

  async storeUpdate(update: Uint8Array, origin: unknown): Promise<void> {
    if (
      this._readOnly ||
      this.version ||
      origin === DYNAMODB_PERSISTENCE_ORIGIN
    ) {
      return;
    }
    await this._mux.push(async () => {
      await this.whenSynced;
      const data = await tables();
      await data.docsyncupdates.put(
        {
          id: this.name,
          seq: `${Date.now()}:${Math.floor(Math.random() * 10000)}:${nanoid()}`,
          data: Buffer.from(update).toString('base64'),
        },
        true
      );
      this.emit('saved', [this]);
    });
  }

  async compact(): Promise<void> {
    if (this._readOnly || this.version) {
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
      let merged: Uint8Array | undefined;
      let toDelete: DocSyncUpdateRecord[] = [];

      const mergedSize = () => merged?.length ?? 0;

      const pushToDataBase = async () => {
        if (merged) {
          await this.storeUpdate(merged, 'compaction');
        }
        if (toDelete.length) {
          await Promise.all(
            toDelete.map((update) =>
              data.docsyncupdates.delete(
                { id: update.id, seq: update.seq },
                true
              )
            )
          );
        }
        merged = undefined;
        toDelete = [];
      };

      for (const update of updates) {
        const { data: dataString } = update;
        if (!dataString) {
          continue;
        }
        const dataBuffer = Buffer.from(dataString, 'base64');
        if (mergedSize() + dataString.length < MAX_ALLOWED_RECORD_SIZE_BYTES) {
          merged = merged ? mergeUpdates([merged, dataBuffer]) : dataBuffer;
          toDelete.push(update);
        } else {
          // eslint-disable-next-line no-await-in-loop
          await pushToDataBase();
          merged = dataBuffer;
          toDelete.push(update);
        }
      }
      await pushToDataBase();
    }
  }

  flush(): Promise<void> {
    return this._mux.flush().then(noop);
  }

  async destroy(): Promise<void> {
    this.doc.off('destroy', this.destroy);
  }
}
