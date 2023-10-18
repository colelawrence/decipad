import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { TOperation, TSelectionOperation } from '@udecode/plate';
import { Element, Text } from 'slate';

export type NoSelectOperations = Exclude<TOperation, TSelectionOperation>;

export function IsTitle(node: unknown): node is TitleElement {
  return (
    Element.isElement(node) &&
    node.children.length === 1 &&
    Text.isText(node.children[0]) &&
    'type' in node &&
    typeof node.type === 'string' &&
    node.type === ELEMENT_TITLE
  );
}

export function IsTab(node: unknown): node is TabElement {
  return (
    Element.isElement(node) &&
    'type' in node &&
    typeof node.type === 'string' &&
    node.type === ELEMENT_TAB
  );
}

export function IsOldOperation(op: NoSelectOperations): boolean {
  return (
    op.type === 'insert_node' &&
    op.path.length === 1 &&
    op.node.type !== ELEMENT_TAB &&
    op.node.type !== ELEMENT_TITLE
  );
}
