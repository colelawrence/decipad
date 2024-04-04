import {
  EDescendant,
  EElement,
  EElementEntry,
  EElementOrText,
  EMarks,
  ENode,
  ENodeEntry,
  EText,
  ETextEntry,
  PlateEditor,
  TOperation,
  TReactEditor,
  Value,
  TEditor,
  TNode,
} from '@udecode/plate-common';
import type { RefObject } from 'react';
import type { UndoManager } from 'yjs';
import type { Subject } from 'rxjs';
import { BaseEditor, Path } from 'slate';
import type { EventInterceptor } from './event-interception';
import type { MyValue } from './value';
import type { NotebookValue, UserIconKey } from '.';

/**
 * Node
 */

export type MyNode = ENode<MyValue>;
export type MyNodeEntry = ENodeEntry<MyValue>;

/**
 * Editor
 */

export type UndoEditor = {
  undoManager?: UndoManager;
  withoutCapturingUndo?: (cb: () => void) => void;
};

export interface EditorObserverMessage<T extends MyElement = MyElement> {
  opType: TOperation['type'];
  element: T;
}

export type MyGenericEditor<TV extends Value> = PlateEditor<TV> & {
  isDragging?: boolean;
  interceptEvent?: EventInterceptor;
  previewRef?: RefObject<HTMLDivElement>;
} & UndoEditor;

export type MyEditor = MyGenericEditor<MyValue>;
export type MyTabEditor = MyEditor & {
  tabName: string;
  icon?: UserIconKey;
  isHidden?: boolean;
};
export type MyReactEditor = TReactEditor<MyValue>;

export type RootEditor = MyGenericEditor<NotebookValue>;

export type MinimalRootEditor = Pick<
  TEditor<NotebookValue>,
  | 'selection'
  | 'children'
  | 'onChange'
  | 'apply'
  | 'id'
  | 'destroy'
  | 'withoutNormalizing'
> & {
  getNode: (path: Path) => TNode | null;
};

interface WithTitleEditor {
  getTitleEditor: () => BaseEditor;
}
interface WithTabs {
  insertTab: (tabId?: string, skipParagraph?: boolean) => string;
  renameTab: (tabId: string, name: string) => void;
  removeTab: (tabId: string) => void;
  moveTabs: (fromId: string, toId: string) => void;
  changeTabIcon: (fromId: string, icon: UserIconKey) => void;
  toggleShowHideTab: (tabId: string) => void;
  getTabEditor: (tabId?: string) => MyEditor;
  getTabEditorIndex: (tabId?: string) => number;
  getTabEditorAt: (tabIndex: number) => MyEditor;
}

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

interface WithEvents {
  events: Subject<ObservableRootEditorEvent>;
}

export interface WithUndo {
  undo: () => void;
  redo: () => void;
}

export type MinimalRootEditorWithEventsAndObserver = MinimalRootEditor &
  WithEvents;

export type MinimalRootEditorWithEventsAndTabs =
  MinimalRootEditorWithEventsAndObserver & WithTabs;

export type MinimalRootEditorWithEventsAndTabsAndUndo =
  MinimalRootEditorWithEventsAndTabs & WithUndo;

export type MinimalRootEditorWithEventsAndTabsAndUndoAndTitleEditor =
  MinimalRootEditorWithEventsAndTabsAndUndo & WithTitleEditor;
/**
 * Element
 */

export type MyElement = EElement<MyValue>;

export type MyElementEntry = EElementEntry<MyValue>;

/**
 * Text
 */

export type MyText = EText<MyValue>;
export type MyTextEntry = ETextEntry<MyValue>;

export type MyElementOrText = EElementOrText<MyValue>;
export type MyDescendant = EDescendant<MyValue>;
export type MyMarks = EMarks<MyValue>;
export type MyMark = keyof MyMarks;
