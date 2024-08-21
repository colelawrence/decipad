import type {
  EElement,
  ENode,
  TEditor,
  TOperation,
} from '@udecode/plate-common';
import type {
  MyEditor,
  NotebookValue,
  UserIconKey,
} from '@decipad/editor-types';
import type { Subject } from 'rxjs';
import type { BaseEditor, Path } from 'slate';

export interface ObservableRootEditorNewTabEvent {
  type: 'new-tab';
}
export interface ObservableRootEditorAnyChangeEvent {
  type: 'any-change';
  op?: TOperation;
}
export interface ObservableRootEditorRemoveTabEvent {
  type: 'remove-tab';
}
export interface ObservableRootEditorUndoEvent {
  type: 'undo';
}
export interface ObservableRootEditorRedoEvent {
  type: 'redo';
}
export interface ObservableRootEditorNewTabEditorEvent {
  type: 'new-tab-editor';
  editor: TEditor;
}
export interface ObservableRootEditorRootEvent {
  type: 'root-any-change';
  op: TOperation;
}

export type ObservableRootEditorEvent =
  | ObservableRootEditorNewTabEvent
  | ObservableRootEditorAnyChangeEvent
  | ObservableRootEditorRemoveTabEvent
  | ObservableRootEditorUndoEvent
  | ObservableRootEditorRedoEvent
  | ObservableRootEditorNewTabEditorEvent
  | ObservableRootEditorRootEvent;

export interface ObservableRootEditor {
  events: Subject<ObservableRootEditorEvent>;
}

interface TabSelectable {
  selectTab: (tabIndex: number) => void;
}

interface TabEditable {
  insertTab: (tabId?: string, skipParagraph?: boolean) => string;
  removeTab: (tabId: string) => void;
  renameTab: (tabId: string, name: string) => void;
  toggleShowHideTab: (tabId: string) => void;
  changeTabIcon: (tabId: string, icon: UserIconKey) => void;
  getTabEditor: (tabId?: string) => MyEditor;
  getTabEditorIndex: (tabId?: string) => number;
  getTabEditorAt: (tabIndex: number) => MyEditor;
  getAllTabEditors: () => Array<MyEditor>;
  moveTabs: (fromTabId: string, toTabId: string) => void;

  isMoving: boolean;
  whileMoving: (callback: () => void) => void;
}

interface TitleEditable {
  getTitleEditor: () => BaseEditor;
}

interface WithoutNormalizingRootEditor {
  withoutNormalizing: (cb: () => void) => void;
}

interface ClearableEditor {
  clearAllInFirstTab: () => void;
}

interface GetAndFindNodeEditor {
  getNode: (path: Path) => ENode<NotebookValue> | null;
  findNodeById: (id: string) => EElement<NotebookValue> | null;
}

type RootEditorExtensions = ObservableRootEditor &
  TitleEditable &
  TabEditable &
  TabSelectable &
  WithoutNormalizingRootEditor &
  GetAndFindNodeEditor &
  ClearableEditor;

export type RootEditorController = Pick<
  TEditor<NotebookValue>,
  'selection' | 'children' | 'onChange' | 'apply' | 'id' | 'destroy'
> &
  RootEditorExtensions;
