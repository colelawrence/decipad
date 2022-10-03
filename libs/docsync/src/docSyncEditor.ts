import { CursorEditor, YjsEditor } from '@decipad/slate-yjs';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { TWebSocketProvider } from '@decipad/y-websocket';
import EventEmitter from 'events';
import { Doc as YDoc } from 'yjs';
import { BehaviorSubject } from 'rxjs';
import { MyEditor } from '@decipad/editor-types';
import {
  DocSyncEditor,
  OnLoadedCallback,
  OnSavedCallback,
  SyncSource,
} from './types';

export interface StatusEvent {
  status: 'connected' | 'disconnected';
}

export function docSyncEditor<E extends MyEditor>(
  editor: E & YjsEditor & CursorEditor,
  doc: YDoc,
  store: IndexeddbPersistence,
  ws?: TWebSocketProvider
): E & DocSyncEditor {
  const events = new EventEmitter();
  let isConnected = false;

  store.on('synced', function onStoreSynced() {
    events.emit('loaded', 'local');
  });
  store.on(
    'saved',
    function onStoreSaved(_provider: IndexeddbPersistence, isLocal?: boolean) {
      const source: SyncSource = isLocal ? 'local' : 'remote';
      events.emit('saved', source);
    }
  );

  if (ws) {
    ws.on('synced', function onWsSynced(synced: boolean) {
      if (synced) {
        events.emit('loaded', 'remote');
      }
    });
    ws.on('saved', function onWsSaved() {
      events.emit('saved', 'remote');
      isSavedRemotely.next(false);
    });
    ws.on('status', function onWsStatus(event: StatusEvent) {
      if (event.status === 'connected') {
        isConnected = true;
        events.emit('connected');
      } else if (event.status === 'disconnected') {
        isConnected = false;
        events.emit('disconnected');
      }
    });
    ws.on('error', (err: Error) => {
      // eslint-disable-next-line no-console
      console.error('Error caught in websocket:', err);
    });
  }

  const hasLocalChanges = new BehaviorSubject<boolean>(false);
  const isSavedRemotely = new BehaviorSubject<boolean>(false);

  store.once('synced', () => {
    let savedCount = 0;
    events.on('saved', (ev: SyncSource) => {
      savedCount += 1;
      if (savedCount > 1) {
        savedCount = 1;
        if (ev === 'local') {
          hasLocalChanges.next(true);
          isSavedRemotely.next(false);
        }
      }
    });
  });

  const useEditor = Object.assign(editor, {
    onLoaded(cb: OnLoadedCallback) {
      events.on('loaded', cb);
    },
    offLoaded(cb: OnLoadedCallback) {
      events.removeListener('loaded', cb);
    },
    onSaved(cb: OnSavedCallback) {
      events.on('saved', cb);
    },
    offSaved(cb: OnSavedCallback) {
      events.removeListener('saved', cb);
    },
    onConnected(cb: OnLoadedCallback) {
      events.on('connected', cb);
    },
    offConnected(cb: OnLoadedCallback) {
      events.removeListener('connected', cb);
    },
    onDisconnected(cb: OnLoadedCallback) {
      events.on('disconnected', cb);
    },
    offDisconnected(cb: OnLoadedCallback) {
      events.removeListener('disconnected', cb);
    },
    onDestroyed(cb: () => void) {
      events.on('destroyed', cb);
    },
    offDestroyed(cb: () => void) {
      events.removeListener('destroyed', cb);
    },
    destroy() {
      events.emit('destroyed');
      events.removeAllListeners();
      doc.destroy();
      store.destroy();
      ws?.destroy();
    },
    connect() {
      ws?.connect();
    },
    disconnect() {
      ws?.disconnect();
    },
    get connected() {
      return isConnected;
    },
    hasLocalChanges() {
      return hasLocalChanges;
    },
    isSavedRemotely() {
      return isSavedRemotely;
    },
    removeLocalChanges() {
      return store.remove();
    },
    setLoadedRemotely() {
      events.emit('loaded', 'remotely');
    },
    isDocSyncEnabled: true,
  });

  return useEditor;
}
