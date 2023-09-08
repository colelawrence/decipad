import { CursorEditor, toSlateDoc, YjsEditor } from '@decipad/slate-yjs';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { TWebSocketProvider } from '@decipad/y-websocket';
import EventEmitter from 'events';
import { canonicalize } from 'json-canonicalize';
import md5 from 'md5';
import { Doc as YDoc } from 'yjs';
import { BehaviorSubject } from 'rxjs';
import { MyEditor } from '@decipad/editor-types';
import { supportBigIntToJSON } from '@decipad/utils';
import {
  DocSyncEditor,
  OnLoadedCallback,
  OnSavedCallback,
  SyncSource,
  OnConnectedCallback,
} from './types';
import { download } from './download';

supportBigIntToJSON();

export function docSyncEditor<E extends MyEditor>(
  editor: E & YjsEditor & CursorEditor,
  doc: YDoc,
  store?: IndexeddbPersistence,
  ws?: TWebSocketProvider
): E & DocSyncEditor {
  const events = new EventEmitter();

  store?.on('synced', function onStoreSynced() {
    events.emit('loaded', 'local');
  });
  store?.on(
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
        isSavedRemotely.next(true);
      }
    });
    ws.on('saved', function onWsSaved() {
      events.emit('saved', 'remote');
      isSavedRemotely.next(true);
    });
    ws.on('status', function onWsStatus(event: { status: string }) {
      if (event.status === 'connected') {
        events.emit('connected');
      }
    });
    ws.on('error', (err: Error) => {
      // eslint-disable-next-line no-console
      console.error('Error caught in websocket:', err);
    });
  }

  const hasLocalChanges = new BehaviorSubject<boolean>(false);
  const isSavedRemotely = new BehaviorSubject<boolean>(false);

  const onceStoreSynced = () => {
    let savedCount = 0;
    events.on('saved', (source: SyncSource) => {
      savedCount += 1;
      if (savedCount > 1) {
        savedCount = 1;
        if (source === 'local') {
          hasLocalChanges.next(true);
          isSavedRemotely.next(false);
        }
      }
    });
  };
  if (store) {
    store.once('synced', onceStoreSynced);
  } else {
    onceStoreSynced();
  }

  let destroyed = false;
  events.once('destroyed', () => {
    destroyed = true;
  });

  const { destroy } = editor;

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
    onConnected(cb: OnConnectedCallback) {
      events.on('connected', cb);
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
      store?.destroy();
      ws?.destroy();
      destroy.call(editor);
    },
    connect() {
      ws?.connect();
    },
    disconnect() {
      ws?.disconnect();
    },
    hasLocalChanges() {
      return hasLocalChanges;
    },
    isSavedRemotely() {
      return isSavedRemotely;
    },
    removeLocalChanges() {
      return store?.remove() || Promise.resolve();
    },
    setLoadedRemotely() {
      events.emit('loaded', 'remote');
    },
    isDocSyncEnabled: true,
    isLoadedLocally: false,
    isLoadedRemotely: false,
    markVersion: (version: string) =>
      store?.markVersion(version) || Promise.resolve(),
    sameVersion: (version: string) =>
      store?.sameVersion(version) || Promise.resolve(false),
    equals: (checksumRemote: string) => {
      const canonicalizedObj = canonicalize(toSlateDoc(doc.getArray()));
      const checksumLocal = md5(canonicalizedObj);

      return checksumLocal === checksumRemote;
    },
    get destroyed() {
      return destroyed;
    },
    getVersionChecksum() {
      return md5(canonicalize(toSlateDoc(doc.getArray())));
    },
    download() {
      download(useEditor as DocSyncEditor);
    },
  });

  return useEditor;
}
