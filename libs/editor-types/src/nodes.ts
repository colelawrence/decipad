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
  TReactEditor,
} from '@udecode/plate';
import { MyValue } from './value';

/**
 * Node
 */

export type MyNode = ENode<MyValue>;
export type MyNodeEntry = ENodeEntry<MyValue>;

/**
 * Editor
 */

export type MyEditor = PlateEditor<MyValue> & { isDragging?: boolean };
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
