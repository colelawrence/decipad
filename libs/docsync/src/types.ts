import { MinimalRootEditor } from '@decipad/editor-types';
import {
  type TCursorEditor as GTCursorEditor,
  type TYjsEditor as GTYjsEditor,
} from '@decipad/slate-yjs';
import { BehaviorSubject } from 'rxjs';
import { Array as YArray, Text as YText, Map as YMap, UndoManager } from 'yjs';
import { MinimalRootEditorWithEventsAndTabsAndUndoAndTitleEditor } from '../../editor-types/src/nodes';

export type Doc = YArray<RootElement>;

export type RootElement = YMap<YArray<LeafElement> | string>;

export type LeafElement = YMap<YText>;

export type SyncSource = 'local' | 'remote';

export type OnLoadedCallback = (source: SyncSource) => void;
export type OnSavedCallback = (source: SyncSource) => void;
export type OnConnectedCallback = () => void;
export type OnDisconnectedCallback = () => void;

interface UndoEditor {
  undo: () => void;
  redo: () => void;
  undoManager?: UndoManager;
  clearAll: () => void;
}

type TYjsEditor = GTYjsEditor<MinimalRootEditor>;
type TCursorEditor = GTCursorEditor<MinimalRootEditor>;

export type DocSyncEditor = TYjsEditor &
  TCursorEditor &
  MinimalRootEditorWithEventsAndTabsAndUndoAndTitleEditor &
  UndoEditor & {
    withoutCapturingUndo?: (cb: () => void) => void;
    isReadOnly?: boolean;
    isLoadedLocally: boolean;
    isLoadedRemotely: boolean;
    onLoaded: (cb: OnLoadedCallback) => void;
    offLoaded: (cb: OnLoadedCallback) => void;
    onSaved: (cb: OnSavedCallback) => void;
    offSaved: (cb: OnSavedCallback) => void;
    onConnected: (cb: OnConnectedCallback) => void;
    destroy: () => void;
    connect: () => void;
    disconnect: () => void;
    hasLocalChanges: () => BehaviorSubject<boolean>;
    isSavedRemotely: () => BehaviorSubject<boolean>;
    setLoadedRemotely: () => void;
    removeLocalChanges: () => Promise<void>;
    isDocSyncEnabled: boolean;
    destroyed: boolean;
    getVersionChecksum: () => string;
    markVersion: (version: string) => Promise<void>;
    sameVersion: (version: string) => Promise<boolean>;
    equals: (data: string) => boolean;
    download: () => void;
  };
