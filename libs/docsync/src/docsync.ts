import { fetch } from '@decipad/fetch';
import { SyncElement, withCursor, withYjs } from '@decipad/slate-yjs';
import { getDefined } from '@decipad/utils';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import {
  TWebSocketProvider,
  createWebsocketProvider,
} from '@decipad/y-websocket';
import { Awareness } from 'y-protocols/awareness';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { MyEditor } from '@decipad/editor-types';
import { PlateEditor } from '@udecode/plate';
import { docSyncEditor } from './docSyncEditor';
import { ensureInitialDocument } from './utils/ensureInitialDocument';
import { setupUndo } from './setupUndo';
import { asLocalEditor } from './asLocalEditor';

const tokenTimeoutMs = 60 * 1000;

interface DocSyncConnectionParams {
  url: string;
  token: string;
}

export interface DocSyncOptions {
  editor: MyEditor;
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
  docId: string,
  {
    editor,
    readOnly = false,
    authSecret,
    onError,
    ws = true,
    connect = ws,
    connectBc = true,
    WebSocketPolyfill,
    connectionParams,
    initialState,
  }: DocSyncOptions
) {
  (editor as PlateEditor).children = [];
  const doc = new YDoc();
  const store = new IndexeddbPersistence(docId, doc);
  const initialTokenTime = Date.now();

  const isInitialTokenStale = () =>
    Date.now() - initialTokenTime > tokenTimeoutMs;

  const getToken = () =>
    isInitialTokenStale() ? undefined : connectionParams?.token;

  const beforeConnect = async (provider: TWebSocketProvider) => {
    try {
      provider.serverUrl = connectionParams?.url || (await wsAddress(docId));
      provider.protocol = authSecret || getToken() || (await fetchToken());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  let wsp: TWebSocketProvider | undefined;
  let awareness: Awareness | undefined;

  const startWebsocket = ws && (!readOnly || !initialState);
  if (startWebsocket) {
    wsp = createWebsocketProvider(doc, {
      WebSocketPolyfill,
      readOnly,
      connect: false,
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
  const yjsEditor = withYjs(editor as MyEditor, shared);

  yjsEditor.synchronizeValue();

  let destroyed = false;
  let synced = false;

  store.once('synced', () => {
    if (synced) {
      return;
    }
    synced = true;
    if (connect && !destroyed) {
      if (initialState) {
        try {
          const update = Buffer.from(initialState, 'base64');
          applyUpdate(doc, update);
          syncEditor.setLoadedRemotely();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error applying initial update', err);
        }
      }
      wsp?.connect();
    }
  });

  // Cursor editor
  const cursorEditor = withCursor(yjsEditor, getDefined(awareness));

  const { normalizeNode } = cursorEditor;
  cursorEditor.normalizeNode = (entry) =>
    asLocalEditor(cursorEditor, () => normalizeNode(entry));

  // Sync editor
  let syncEditor = docSyncEditor(cursorEditor, doc, store, wsp);
  syncEditor.destroy = () => {
    destroyed = true;
    store?.destroy();
    wsp?.destroy();
  };

  syncEditor.isDocSyncEnabled = true;

  let loadedLocally = false;
  let loadedRemotely = false;

  const onLoaded = (source: 'remote' | 'local') => {
    if (!loadedRemotely && (!ws || source === 'remote')) {
      ensureInitialDocument(editor);
    }
    if (source === 'remote') {
      loadedRemotely = true;
    }
    if (source === 'local') {
      loadedLocally = true;
    }
    if (loadedRemotely && loadedLocally) {
      syncEditor.offLoaded(onLoaded);
    }
  };
  syncEditor.onLoaded(onLoaded);

  syncEditor = setupUndo(syncEditor);

  return syncEditor;
}
