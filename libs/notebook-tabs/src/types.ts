import type { EElement, ENode, TEditor } from '@udecode/plate';
import { MyEditor, NotebookValue, UserIconKey } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import { ElementObserver } from './ElementObserver';
import { BaseEditor, Path } from 'slate';
import { ReactEditor } from 'slate-react';

export interface ObservableRootEditorNewTabEvent {
  type: 'new-tab';
}
export interface ObservableRootEditorAnyChangeEvent {
  type: 'any-change';
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

export type ObservableRootEditorEvent =
  | ObservableRootEditorNewTabEvent
  | ObservableRootEditorAnyChangeEvent
  | ObservableRootEditorRemoveTabEvent
  | ObservableRootEditorUndoEvent
  | ObservableRootEditorRedoEvent
  | ObservableRootEditorNewTabEditorEvent;

export interface ObservableRootEditor {
  events: Subject<ObservableRootEditorEvent>;
  elementObserver: ElementObserver;
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
}

interface TitleEditable {
  getTitleEditor: () => BaseEditor & ReactEditor;
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
