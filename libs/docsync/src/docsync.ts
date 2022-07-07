import { fetch } from '@decipad/fetch';
import {
  CursorEditor,
  SyncElement,
  withCursor,
  withYjs,
  YjsEditor,
} from '@decipad/slate-yjs';
import { getDefined } from '@decipad/utils';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import {
  TWebSocketProvider,
  createWebsocketProvider,
} from '@decipad/y-websocket';
import EventEmitter from 'events';
import { Awareness } from 'y-protocols/awareness';
import { Array as YArray, Doc as YDoc, Map as YMap, Text as YText } from 'yjs';
import { BehaviorSubject } from 'rxjs';
import { MyEditor } from '@decipad/editor-types';
import * as DocTypes from './types';

export interface DocSyncOptions {
  readOnly?: boolean;
  authSecret?: string;
  WebSocketPolyfill?: typeof WebSocket;
  onError?: (event: Error | Event) => void;
  ws?: boolean;
  connect?: boolean;
  connectBc?: boolean;
}

interface StatusEvent {
  status: 'connected' | 'disconnected';
}

export type Source = 'local' | 'remote';

export type OnLoadedCallback = (source: Source) => void;
export type OnSavedCallback = (source: Source) => void;
export type OnConnectedCallback = () => void;
export type OnDisconnectedCallback = () => void;

export type DocSyncEditor = MyEditor &
  YjsEditor &
  CursorEditor & {
    onLoaded: (cb: OnLoadedCallback) => void;
    offLoaded: (cb: OnLoadedCallback) => void;
    onSaved: (cb: OnSavedCallback) => void;
    offSaved: (cb: OnSavedCallback) => void;
    onConnected: (cb: OnConnectedCallback) => void;
    offConnected: (cb: OnConnectedCallback) => void;
    onDisconnected: (cb: OnDisconnectedCallback) => void;
    offDisconnected: (cb: OnDisconnectedCallback) => void;
    destroy: () => void;
    connect: () => void;
    disconnect: () => void;
    hasLocalChanges: () => BehaviorSubject<boolean>;
    removeLocalChanges: () => Promise<void>;
    connected: boolean;
    isDocSyncEnabled: boolean;
  };

function ensureInitialDocument(doc: YDoc, root: DocTypes.Doc) {
  doc.transact(() => {
    if (root.length > 1) {
      return;
    }
    if (root.length < 1) {
      root.push([
        new YMap([
          ['type', 'h1'],
          ['children', YArray.from([new YMap([['text', new YText()]])])],
        ]),
      ]);
    }
    if (root.length < 2) {
      root.push([
        new YMap([
          ['type', 'p'],
          ['children', YArray.from([new YMap([['text', new YText()]])])],
        ]),
      ]);
    }
  });
}

function docSyncEditor<E extends MyEditor>(
  editor: E & YjsEditor & CursorEditor,
  shared: YArray<SyncElement>,
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
      const source: Source = isLocal ? 'local' : 'remote';
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

  store.once('synced', () => {
    let savedCount = 0;
    events.on('saved', (ev: Source) => {
      savedCount += 1;
      if (savedCount > 1) {
        savedCount = 1;
        if (ev === 'local') hasLocalChanges.next(true);
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
    destroy() {
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
    removeLocalChanges() {
      return store.remove();
    },
    isDocSyncEnabled: true,
  });

  const onLoaded = (source: 'local' | 'remote') => {
    if (!ws || source === 'remote') {
      ensureInitialDocument(doc, shared);
      useEditor.offLoaded(onLoaded);
    }
  };

  useEditor.onLoaded(onLoaded);

  return useEditor;
}

async function fetchToken(): Promise<string> {
  const resp = await fetch(`/api/auth/token?for=pubsub`);
  if (!resp?.ok) {
    throw new Error(
      `Error fetching token: response code was ${resp.status}: ${
        resp.statusText
      }. response was ${(await resp?.text()) || JSON.stringify(resp)}`
    );
  }
  return resp?.text();
}

async function wsAddress(docId: string): Promise<string> {
  return `${await (await fetch('/api/ws'))?.text()}?doc=${docId}`;
}

export function createDocSyncEditor(
  editor: MyEditor,
  docId: string,
  options: DocSyncOptions = {}
): DocSyncEditor {
  const {
    readOnly = false,
    authSecret,
    onError,
    ws = true,
    connect = ws,
    connectBc = true,
    WebSocketPolyfill,
  } = options;

  const doc = new YDoc();
  const store = new IndexeddbPersistence(docId, doc);

  const beforeConnect = async (provider: TWebSocketProvider) => {
    try {
      provider.serverUrl = await wsAddress(docId);
      provider.protocol = authSecret || (await fetchToken());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  let wsp: TWebSocketProvider | undefined;
  let awareness: Awareness | undefined;
  if (ws) {
    wsp = createWebsocketProvider(doc, {
      WebSocketPolyfill,
      readOnly,
      connect,
      beforeConnect,
      connectBc,
      resyncInterval: 60000,
      onError,
    });
    awareness = wsp.awareness;
  } else {
    awareness = new Awareness(doc);
  }

  // Yjs editor
  const shared = doc.getArray<SyncElement>();
  const yjsEditor = withYjs(editor, shared);

  // Cursor editor
  const cursorEditor = withCursor(yjsEditor, getDefined(awareness));

  // Sync editor
  const syncEditor = docSyncEditor(cursorEditor, shared, doc, store, wsp);
  syncEditor.destroy = () => store.destroy();

  syncEditor.isDocSyncEnabled = true;
  return syncEditor;
}
