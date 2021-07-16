import { PadEditor, PadEditorOptions } from './pad-editor';
import { Sync } from '@decipad/replica';

interface RuntimeConstructorOptions {
  userId: string;
  actorId: string;
  isSynced?: boolean;
  storage?: Storage;
}

const defaultPadEditorOptions = {
  startReplicaSync: true,
};

const maxReconnectMs = Number(process.env.DECI_MAX_RECONNECT_MS) || 10000;
const fetchPrefix = process.env.DECI_API_URL || '';

class Runtime {
  userId: string;
  actorId: string;
  isSynced: boolean;

  sync: Sync<AnySyncValue>;
  editors: Map<Id, PadEditor> = new Map();

  constructor({ userId, actorId, isSynced = true }: RuntimeConstructorOptions) {
    this.userId = userId;
    this.actorId = actorId;
    this.isSynced = isSynced;
    this.sync = new Sync({ start: isSynced, maxReconnectMs, fetchPrefix });
  }

  startPadEditor(
    padId: Id,
    options: PadEditorOptions = defaultPadEditorOptions
  ) {
    let editor = this.editors.get(padId);
    if (editor === undefined) {
      const editorOptions = {
        startReplicaSync: this.isSynced,
        storage: options.storage || global.localStorage,
      };
      editor = new PadEditor(padId, this, editorOptions);
      let hadSubscribers = false;
      editor.slateOpsCountObservable.subscribe((subscriptionCount) => {
        if (subscriptionCount === 0) {
          if (hadSubscribers) {
            editor!.stop();
            this.editors.delete(padId);
          }
        } else {
          hadSubscribers = true;
        }
      });
      this.editors.set(padId, editor);
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

export { Runtime };
