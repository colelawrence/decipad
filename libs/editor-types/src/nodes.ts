import type {
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
} from '@udecode/plate';
import type { RefObject } from 'react';
import type { UndoManager } from 'yjs';
import type { Observable, Subject } from 'rxjs';
import type { EventInterceptor } from './event-interception';
import type { MyValue } from './value';
import type { ElementKind } from '.';

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

export interface ObserverElements {
  elementObserverPool?: Map<
    ElementKind,
    { observer: Observable<EditorObserverMessage>; subsribers: number }
  >;
  specificElementObserverPool?: Map<
    string,
    { observer: Observable<EditorObserverMessage>; subsribers: number }
  >;
  changeObserver$?: Subject<EditorObserverMessage>;
}

export type MyEditor = PlateEditor<MyValue> & {
  isDragging?: boolean;
  interceptEvent?: EventInterceptor;
  previewRef?: RefObject<HTMLDivElement>;
} & UndoEditor;
export type MyReactEditor = TReactEditor<MyValue>;

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
