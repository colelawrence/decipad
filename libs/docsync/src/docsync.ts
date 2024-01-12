import { Session } from 'next-auth';
import { Awareness } from 'y-protocols/awareness';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import stringify from 'json-stringify-safe';
import { fetch } from '@decipad/fetch';
import {
  applySlateOps,
  SyncElement,
  toSlateDoc,
  withCursor,
  withYjs,
} from '@decipad/slate-yjs';
import { IndexeddbPersistence } from '@decipad/y-indexeddb';
import {
  createWebsocketProvider,
  TWebSocketProvider,
} from '@decipad/y-websocket';
import { supports } from '@decipad/support';
import { MinimalRootEditor } from '@decipad/editor-types';
import { docSyncEditor } from './docSyncEditor';
import { setupUndo } from './setupUndo';
import { nanoid } from 'nanoid';
import { getLocalNotebookUpdates } from './getLocalNotebookUpdates';

const tokenTimeoutMs = 60 * 1000;

export const slateYjsSymbol = Symbol('slate-yjs');

declare global {
  interface Window {
    yjsToJson: (text: string) => void;
    jsonToYjs: (json: string) => void;
  }
}

const isTesting = !!process.env.JEST_WORKER_ID;

// A few helper functions to help customer support recover notebooks.
if (
  typeof window !== 'undefined' &&
  (window.location.host.includes('staging.decipad.com') ||
    window.location.host.includes('localhost'))
) {
  window.yjsToJson = (text: string) => {
    const data = Buffer.from(text, 'base64');
    const yjsDoc = new YDoc();
    applyUpdate(yjsDoc, data);
    return { children: toSlateDoc(yjsDoc.getArray()) };
  };

  window.jsonToYjs = (json: string) => {
    const nodes = (JSON.parse(json) as { children: Array<object> }).children;
    const insertOps = [];

    for (let i = 0; i < nodes.length; i++) {
      insertOps.push({
        type: 'insert_node',
        path: [i],
        node: nodes[i],
      });
    }

    const doc = new YDoc();
    const arr = doc.getArray<SyncElement>();

    applySlateOps(arr, insertOps as any, slateYjsSymbol);

    const buf = encodeStateAsUpdate(doc);
    return Buffer.from(buf).toString('base64');
  };
}

interface DocSyncConnectionParams {
  url: string;
  token: string;
}

export interface DocSyncOptions {
  editor: MinimalRootEditor;
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
    editor,
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
  // breaks tests otherwise
  if (!isTesting) {
    global.document.cookie = `docsync_session_token=${nanoid()}; path=/;`;
  }
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
  const yjsEditor = withYjs(editor, shared);

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

          setTimeout(() => {
            if (!destroyed) {
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

  let interval: ReturnType<typeof setInterval> | undefined;
  let lastBackedUpDoc: string;
  // Sync editor
  let syncEditor = docSyncEditor(cursorEditor, doc, store, wsp);
  const { destroy } = syncEditor;
  syncEditor.destroy = () => {
    clearInterval(interval);
    // breaks tests otherwise
    if (!isTesting) {
      document.cookie = `docsync_session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
    destroyed = true;
    store?.destroy();
    wsp?.destroy();
    destroy.call(syncEditor);
  };

  syncEditor.isDocSyncEnabled = true;

  let loadedLocally = false;
  let loadedRemotely = false;

  const onLoaded = (source: 'remote' | 'local') => {
    if (source === 'local' && !isTesting) {
      interval = setInterval(async () => {
        if (!docId) {
          return;
        }
        const arr = await getLocalNotebookUpdates(docId);
        if (!arr) return;
        // convert uint8Array to string
        const yjsDoc = new YDoc();
        applyUpdate(yjsDoc, arr);
        const slateDoc = { children: toSlateDoc(yjsDoc.getArray()) };
        const body = JSON.stringify(slateDoc);
        if (body === lastBackedUpDoc) {
          return;
        }
        const res = await fetch(`/api/pads/${docId}/backups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        });
        if (res.status !== 200) {
          throw new Error(
            `Error backing up pad: response code was ${res.status}: ${res.statusText}`
          );
        }
        lastBackedUpDoc = body;
      }, 5000);
    }
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
