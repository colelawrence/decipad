import EventEmitter from 'events';
import { Editor } from 'slate';
import { Doc as YDoc, Array as YArray, Map as YMap, Text as YText } from 'yjs';
import {
  withCursor,
  withYjs,
  SyncElement,
  YjsEditor,
  CursorEditor,
} from '@decipad/slate-yjs';
import { Awareness } from 'y-protocols/awareness';
import { WebsocketProvider } from '@decipad/y-websocket';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { fetch } from '@decipad/fetch';
import { getDefined } from '@decipad/utils';
import * as DocTypes from './types';

interface Options {
  authSecret?: string;
  WebSocketPolyfill?: typeof WebSocket;
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

export type DocSyncEditor = Editor &
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
      root.push([new YMap()]);
    }
    const h1 = root.get(0);
    h1.set('type', 'h1');
    h1.set('children', new YArray());

    const h1Leafs = getDefined(
      h1.get('children')
    ) as YArray<DocTypes.LeafElement>;
    h1Leafs.push([new YMap()]);
    const h1Leaf = getDefined(h1Leafs.get(0));
    h1Leaf.set('text', new YText());

    root.push([new YMap()]);
    const p = root.get(1);
    p.set('type', 'p');
    p.set('children', new YArray());
    const pLeafs = getDefined(
      p.get('children')
    ) as YArray<DocTypes.LeafElement>;
    pLeafs.push([new YMap()]);
    const pLeaf = getDefined(pLeafs.get(0));
    pLeaf.set('text', new YText());
  });
}

function docSyncEditor(
  editor: Editor & YjsEditor & CursorEditor,
  shared: YArray<SyncElement>,
  doc: YDoc,
  store: IndexeddbPersistence,
  ws?: WebsocketProvider
): DocSyncEditor {
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
    throw new Error(`Error fetching token: ${await resp.text()}`);
  }
  return resp.text();
}

export function withDocSync(
  editor: Editor,
  docId: string,
  options: Options = {}
): DocSyncEditor {
  const {
    authSecret,
    ws = true,
    connect = ws,
    connectBc = true,
    WebSocketPolyfill,
  } = options;
  const doc = new YDoc();
  const store = new IndexeddbPersistence(docId, doc);

  const beforeConnect = async (provider: WebsocketProvider) => {
    try {
      const token = authSecret || (await fetchToken());
      provider.protocol = token;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  let wsp: WebsocketProvider | undefined;
  let awareness: Awareness | undefined;
  if (ws) {
    const wsAddress = `${
      process.env.NEXT_PUBLIC_DECI_WS_URL || 'ws://localhost:3333/ws'
    }?doc=${docId}`;

    wsp = new WebsocketProvider(wsAddress, doc, {
      WebSocketPolyfill,
      connect,
      beforeConnect,
      connectBc,
      resyncInterval: 60000,
    });
    awareness = wsp.awareness;
  } else {
    awareness = new Awareness(doc);
  }
  const shared = doc.getArray<SyncElement>();
  const syncEditor = withCursor(withYjs(editor, shared), getDefined(awareness));
  return docSyncEditor(syncEditor, shared, doc, store, wsp);
}
