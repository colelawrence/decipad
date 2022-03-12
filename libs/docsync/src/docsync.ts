import { Editor } from '@decipad/editor-types';
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
import { WebsocketProvider } from '@decipad/y-websocket';
import EventEmitter from 'events';
import { Awareness } from 'y-protocols/awareness';
import { Array as YArray, Doc as YDoc, Map as YMap, Text as YText } from 'yjs';
import * as DocTypes from './types';

interface Options {
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

type Source = 'local' | 'remote';

type OnLoadedCallback = (source: Source) => void;
type OnSavedCallback = (source: Source) => void;
type OnConnectedCallback = () => void;
type OnDisconnectedCallback = () => void;

export type DocSyncEditor<E extends Editor = Editor> = E &
  YjsEditor &
  CursorEditor & {
    onLoaded: (cb: OnLoadedCallback) => void;
    onSaved: (cb: OnSavedCallback) => void;
    onConnected: (cb: OnConnectedCallback) => void;
    onDisconnected: (cb: OnDisconnectedCallback) => void;
    destroy: () => void;
    connect: () => void;
    disconnect: () => void;
    connected: boolean;
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

function docSyncEditor<E extends Editor>(
  editor: E & YjsEditor & CursorEditor,
  shared: YArray<SyncElement>,
  doc: YDoc,
  store: IndexeddbPersistence,
  ws?: WebsocketProvider
): E & DocSyncEditor {
  const events = new EventEmitter();
  let isConnected = false;

  store.on('synced', function onStoreSynced() {
    events.emit('loaded', 'local');
  });
  store.on('saved', function onStoreSaved() {
    events.emit('saved', 'local');
  });

  if (ws) {
    ws.on('synced', function onWsSynced() {
      events.emit('loaded', 'remote');
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

  const useEditor = Object.assign(editor, {
    onLoaded(cb: OnLoadedCallback) {
      events.on('loaded', cb);
    },
    onSaved(cb: OnSavedCallback) {
      events.on('saved', cb);
    },
    onConnected(cb: OnLoadedCallback) {
      events.on('connected', cb);
    },
    onDisconnected(cb: OnLoadedCallback) {
      events.on('disconnected', cb);
    },
    destroy() {
      events.removeAllListeners();
      doc.destroy();
      store.destroy();
      ws?.destroy();
    },
    connect() {
      getDefined(ws, 'no provider').connect();
    },
    disconnect() {
      getDefined(ws, 'no provider').disconnect();
    },
    get connected() {
      return isConnected;
    },
  });

  useEditor.onLoaded((source: 'local' | 'remote') => {
    if (!ws || source === 'remote') {
      ensureInitialDocument(doc, shared);
    }
  });

  return useEditor;
}

async function fetchToken(): Promise<string> {
  const resp = await fetch(`/api/auth/token?for=pubsub`);
  if (!resp.ok) {
    throw new Error(
      `Error fetching token: response code was ${resp.status}: ${
        resp.statusText
      }. response was ${(await resp.text()) || JSON.stringify(resp)}`
    );
  }
  return resp.text();
}

async function wsAddress(docId: string): Promise<string> {
  return `${await (await fetch('/api/ws')).text()}?doc=${docId}`;
}

export function withDocSync<E extends Editor>(
  editor: E,
  docId: string,
  options: Options = {}
): E & DocSyncEditor {
  const {
    authSecret,
    onError,
    ws = true,
    connect = ws,
    connectBc = true,
    WebSocketPolyfill,
  } = options;
  const doc = new YDoc();
  const store = new IndexeddbPersistence(docId, doc);

  const beforeConnect = async (provider: WebsocketProvider) => {
    try {
      provider.serverUrl = await wsAddress(docId);
      provider.protocol = authSecret || (await fetchToken());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  let wsp: WebsocketProvider | undefined;
  let awareness: Awareness | undefined;
  if (ws) {
    wsp = new WebsocketProvider(doc, {
      WebSocketPolyfill,
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
  const shared = doc.getArray<SyncElement>();
  const syncEditor = withCursor(withYjs(editor, shared), getDefined(awareness));
  return docSyncEditor(syncEditor, shared, doc, store, wsp);
}
