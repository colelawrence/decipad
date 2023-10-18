import { Session } from 'next-auth';
import { Awareness } from 'y-protocols/awareness';
import { applyUpdate, Doc as YDoc } from 'yjs';
import stringify from 'json-stringify-safe';
import { fetch } from '@decipad/fetch';
import { SyncElement, withCursor, withYjs } from '@decipad/slate-yjs';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import { EditorController } from '@decipad/notebook-tabs';
import {
  TWebSocketProvider,
  createWebsocketProvider,
} from '@decipad/y-websocket';
import { supports } from '@decipad/support';
import { docSyncEditor } from './docSyncEditor';
import { setupUndo } from './setupUndo';

const tokenTimeoutMs = 60 * 1000;

// AAA= is state for a completely empty Yjs document.
const EMPTY_STATE = 'AAA=';

interface DocSyncConnectionParams {
  url: string;
  token: string;
}

export interface DocSyncOptions {
  controller: EditorController;
  readOnly?: boolean;
  authSecret?: string;
  WebSocketPolyfill?: typeof WebSocket;
  onError?: (event: Error | Event) => void;
  ws?: boolean;
  connect?: boolean;
  connectionParams?: DocSyncConnectionParams;
  initialState?: string;
  protocolVersion: number;
}

async function fetchToken(): Promise<string> {
  const resp = await fetch(`/api/auth/token?for=pubsub`);
  if (!resp?.ok) {
    throw new Error(
      `Error fetching token: response code was ${resp.status}: ${
        resp.statusText
      }. response was ${(await resp?.text()) || stringify(resp)}`
    );
  }
  return resp?.text();
}

async function wsAddress(docId: string): Promise<string> {
  return `${await (await fetch('/api/ws'))?.text()}?doc=${encodeURIComponent(
    docId
  )}&protocol=2`;
}

export function createDocSyncEditor(
  docId: string,
  {
    controller,
    readOnly = false,
    authSecret,
    onError,
    ws = true,
    connect = ws,
    WebSocketPolyfill,
    connectionParams,
    initialState,
    protocolVersion,
  }: DocSyncOptions,
  getSession: () => Session | undefined = () => undefined
) {
  const doc = new YDoc();
  const store = supports('indexeddb')
    ? new IndexeddbPersistence(docId, doc, { readOnly })
    : undefined;
  const initialTokenTime = Date.now();

  const isInitialTokenStale = () =>
    Date.now() - initialTokenTime > tokenTimeoutMs;

  const getToken = () =>
    isInitialTokenStale() ? undefined : connectionParams?.token;

  const beforeConnect = async (provider: TWebSocketProvider) => {
    try {
      provider.serverUrl = connectionParams?.url
        ? `${connectionParams.url}`
        : await wsAddress(docId);
      provider.protocol = authSecret || getToken() || (await fetchToken());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  let wsp: TWebSocketProvider | undefined;
  let awareness: Awareness | undefined;

  const startWebsocket =
    ws && supports('websockets') && (!readOnly || initialState == null);
  if (startWebsocket) {
    wsp = createWebsocketProvider(doc, {
      WebSocketPolyfill,
      readOnly,
      connect: false,
      beforeConnect,
      resyncInterval: 60000,
      onError,
      protocolVersion,
    });
    awareness = wsp.awareness;
  } else {
    awareness = new Awareness(doc);
  }

  // Yjs editor
  const shared = doc.getArray<SyncElement>();
  const yjsEditor = withYjs(controller, shared);

  let destroyed = false;
  let synced = false;

  const onceSynced = () => {
    if (synced) {
      return;
    }
    synced = true;
    if (connect && !destroyed) {
      if (initialState != null) {
        try {
          const update = Buffer.from(initialState, 'base64');
          applyUpdate(doc, update);

          const isInitialState = initialState === EMPTY_STATE;
          setTimeout(() => {
            if (!destroyed) {
              controller.Loaded(undefined, isInitialState);
              syncEditor.setLoadedRemotely();
            }
          }, 0);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error applying initial update', err);
        }
      }
      wsp?.connect();
    }
  };

  if (store) {
    store.once('synced', onceSynced);
  } else {
    setTimeout(() => {
      if (!destroyed) {
        onceSynced();
      }
    }, 0);
  }

  // Cursor editor
  const cursorEditor = withCursor(yjsEditor, awareness, getSession);

  // Sync editor
  let syncEditor = docSyncEditor(cursorEditor, doc, store, wsp);
  const { destroy } = syncEditor;
  syncEditor.destroy = () => {
    destroyed = true;
    store?.destroy();
    wsp?.destroy();
    destroy.call(syncEditor);
  };

  syncEditor.isDocSyncEnabled = true;

  let loadedLocally = false;
  let loadedRemotely = false;

  const onLoaded = (source: 'remote' | 'local') => {
    if (source === 'remote') {
      syncEditor.isLoadedRemotely = true;
      loadedRemotely = true;
    }
    if (source === 'local') {
      syncEditor.isLoadedLocally = true;
      loadedLocally = true;
    }
    if (loadedRemotely && loadedLocally) {
      syncEditor.offLoaded(onLoaded);
    }
  };
  syncEditor.onLoaded(onLoaded);

  syncEditor = setupUndo(syncEditor);

  syncEditor.isReadOnly = readOnly;

  return syncEditor;
}
