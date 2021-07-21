import { ReplicaStorage } from '@decipad/interfaces';
import { Sync } from '@decipad/replica';
import { LRUStorage } from '@decipad/lrustorage';
import { SyncEditor, SyncEditorOptions } from './sync-editor';

interface ISyncDocConstructorOptions {
  userId: string;
  actorId: string;
  isSynced?: boolean;
  storage?: ReplicaStorage;
}

const defaultSyncEditorOptions = {
  startReplicaSync: true,
};

const maxReconnectMs = Number(process.env.DECI_MAX_RECONNECT_MS) || 10000;
const fetchPrefix = process.env.DECI_API_URL || '';

export class DocSync {
  userId: string;
  actorId: string;
  isSynced: boolean;

  sync: Sync<SyncValue>;
  editors: Map<string, SyncEditor> = new Map();

  constructor({
    userId,
    actorId,
    isSynced = true,
  }: ISyncDocConstructorOptions) {
    this.userId = userId;
    this.actorId = actorId;
    this.isSynced = isSynced;
    this.sync = new Sync({ start: isSynced, maxReconnectMs, fetchPrefix });
  }

  edit(docId: string, options: SyncEditorOptions = defaultSyncEditorOptions) {
    let editor = this.editors.get(docId);
    if (editor === undefined) {
      const editorOptions = {
        startReplicaSync: this.isSynced,
        storage: options.storage || new LRUStorage(global.localStorage),
      };
      editor = new SyncEditor(docId, this, editorOptions);
      let hadSubscribers = false;
      editor.slateOpsCountObservable.subscribe((subscriptionCount) => {
        if (subscriptionCount === 0) {
          if (hadSubscribers) {
            editor!.stop();
            this.editors.delete(docId);
          }
        } else {
          hadSubscribers = true;
        }
      });
      this.editors.set(docId, editor);
    }
    return editor;
  }

  websocketImpl(): typeof WebSocket {
    return this.sync.websocketImpl();
  }

  stop() {
    this.sync.stop();
    for (const editor of this.editors.values()) {
      editor.stop();
    }
  }
}
