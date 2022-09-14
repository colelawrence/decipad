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
import { applyUpdate, Doc as YDoc } from 'yjs';
import { BehaviorSubject } from 'rxjs';
import { MyEditor } from '@decipad/editor-types';

const tokenTimeoutMs = 60 * 1000;

interface DocSyncConnectionParams {
  url: string;
  token: string;
}

export interface DocSyncOptions {
  readOnly?: boolean;
  authSecret?: string;
  WebSocketPolyfill?: typeof WebSocket;
  onError?: (event: Error | Event) => void;
  ws?: boolean;
  connect?: boolean;
  connectBc?: boolean;
  connectionParams?: DocSyncConnectionParams;
  initialState?: string;
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
    isSavedRemotely: () => BehaviorSubject<boolean>;
    removeLocalChanges: () => Promise<void>;
    connected: boolean;
    isDocSyncEnabled: boolean;
  };

function docSyncEditor<E extends MyEditor>(
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
    events.on('saved', (ev: Source) => {
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
      destroy();
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
    isDocSyncEnabled: true,
  });

  const onLoaded = (source: 'local' | 'remote') => {
    if (!ws || source === 'remote') {
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
    connectionParams,
    initialState,
  } = options;

  const doc = new YDoc();
  const store = new IndexeddbPersistence(docId, doc);
  const initialTokenTime = Date.now();

  const isInitialTokenStale = () =>
    Date.now() - initialTokenTime > tokenTimeoutMs;

  const getToken = () =>
    isInitialTokenStale() ? undefined : connectionParams?.url;

  const beforeConnect = async (provider: TWebSocketProvider) => {
    try {
      provider.serverUrl = getToken() || (await wsAddress(docId));
      provider.protocol =
        authSecret || connectionParams?.token || (await fetchToken());
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
  const syncEditor = docSyncEditor(cursorEditor, doc, store, wsp);
  syncEditor.destroy = () => {
    store.destroy();
    wsp?.destroy();
  };

  syncEditor.isDocSyncEnabled = true;

  if (initialState) {
    setTimeout(() => {
      try {
        applyUpdate(doc, Buffer.from(initialState, 'base64'), wsp);
        wsp?.emit('synced', [true]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('error applying update for initial state:', err);
      }
    }, 0);
  }

  return syncEditor;
}
