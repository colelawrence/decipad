import { MyEditor } from '@decipad/editor-types';
import { CursorEditor, YjsEditor } from '@decipad/slate-yjs';
import { BehaviorSubject } from 'rxjs';
import { Array as YArray, Text as YText, Map as YMap } from 'yjs';

export type Doc = YArray<RootElement>;

export type RootElement = YMap<YArray<LeafElement> | string>;

export type LeafElement = YMap<YText>;

export type SyncSource = 'local' | 'remote';

export type OnLoadedCallback = (source: SyncSource) => void;
export type OnSavedCallback = (source: SyncSource) => void;
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
    setLoadedRemotely: () => void;
    removeLocalChanges: () => Promise<void>;
    connected: boolean;
    isDocSyncEnabled: boolean;
    markVersion: (version: string) => Promise<void>;
    sameVersion: (version: string) => Promise<boolean>;
    equals: (data: string) => boolean;
  };
