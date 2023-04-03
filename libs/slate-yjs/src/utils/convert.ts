import {
  BlockElement,
  MyElement,
  MyDescendant,
  MyNode,
  PlainText,
  MyValue,
} from '@decipad/editor-types';
import { Path } from 'slate';
import * as Y from 'yjs';
import { isElement, isText } from '@udecode/plate';
import { supportBigIntToJSON } from '@decipad/utils';
import { SharedType, SyncElement } from '../model';

supportBigIntToJSON();

/**
 * Converts a sync element to a slate node
 *
 * @param element
 */
export function toSlateNode(element: SyncElement): MyNode {
  const text = SyncElement.getText(element);
  const children = SyncElement.getChildren(element);

  const node: Partial<MyElement | MyNode> = {};
  if (text !== undefined) {
    (node as PlainText).text = text.toString();
  }
  if (children !== undefined) {
    (node as BlockElement).children = children.map(
      toSlateNode
    ) as BlockElement['children'];
  }

  const entries = element.entries();

  Array.from(entries).forEach(([key, value]) => {
    if (key !== 'children' && key !== 'text') {
      (node as Record<string, unknown>)[key] = value;
    }
  });

  return node as MyNode;
}

/**
 * Converts a SharedType to a Slate doc
 * @param doc
 */
export function toSlateDoc(doc: SharedType): MyValue {
  return doc.map(toSlateNode) as MyValue;
}

/**
 * Converts a slate node to a sync element
 *
 * @param node
 */
export function toSyncElement(node: MyElement | MyDescendant): SyncElement {
  const element: SyncElement = new Y.Map();

  if (isElement(node)) {
    const childElements = node.children.map(toSyncElement);
    const childContainer = new Y.Array();
    childContainer.insert(0, childElements);
    element.set('children', childContainer);
  }

  if (isText(node)) {
    const textElement = new Y.Text(node.text);
    element.set('text', textElement);
  }

  Object.entries(node).forEach(([key, value]) => {
    if (key !== 'children' && key !== 'text') {
      element.set(key, value);
    }
  });

  return element;
}

/**
 * Converts all elements int a Slate doc to SyncElements and adds them
 * to the SharedType
 *
 * @param sharedType
 * @param doc
 */
export function toSharedType(sharedType: SharedType, doc: MyElement[]): void {
  sharedType.insert(0, doc.map(toSyncElement));
}

/**
 * Same as toShareType but takes in a singular element instead,
 * to avoid DynamoDBs size limit.
 */
export function toSharedTypeSingular(
  sharedType: SharedType,
  doc: MyElement,
  pos: number
): void {
  sharedType.insert(pos, [toSyncElement(doc)]);
}

/**
 * Converts a SharedType path the a slate path
 *
 * @param path
 */
export function toSlatePath(path: (string | number)[]): Path {
  return path.filter((node) => typeof node === 'number') as Path;
}
