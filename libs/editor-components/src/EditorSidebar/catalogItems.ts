import { MyEditor, MyValue } from '@decipad/editor-types';
import { findNode, getNodeString } from '@udecode/plate';
import { NodeEntry, Path } from 'slate';
import { findParent } from './findParent';
import { CatalogHeadingItem, CatalogItemVar, CatalogItems } from './types';

const insertInOrder = (
  items: CatalogItems,
  heading: CatalogHeadingItem,
  name: CatalogItemVar
): CatalogItems => {
  let insertAt = -1;
  let found = false;
  while (insertAt < items.length && !found) {
    insertAt += 1;
    const current = items[insertAt];
    if (
      !current ||
      (current.type !== 'var' && Path.isAfter(current.path, heading.path))
    ) {
      found = true;
    }
  }
  while (items[insertAt]?.type === 'var') {
    insertAt += 1;
  }
  return [...items.slice(0, insertAt), heading, name, ...items.slice(insertAt)];
};

const catalogItem =
  (editor: MyEditor) =>
  (curr: CatalogItems, name: CatalogItemVar): CatalogItems => {
    const entry = findNode(editor, {
      at: [],
      match: { id: name.blockId },
    });
    if (!entry) {
      return [...curr, name];
    }
    const parent = findParent(editor, entry as NodeEntry<MyValue[number]>);
    if (!parent) {
      return [...curr, name];
    }

    const [parentNode, parentPath] = parent;
    const parentIndex = curr.findIndex((el) => el.blockId === parentNode.id);
    if (parentIndex < 0) {
      // we are removing expr_Refs from number catalog headings
      // so people can read their h2, and h3s
      const textChildren = parentNode.children.filter(
        (node) => !node.magicnumberz
      );
      const adoptiveParent = { ...parentNode, children: textChildren };
      return insertInOrder(
        curr,
        {
          type: parentNode.type,
          blockId: parentNode.id,
          name: getNodeString(adoptiveParent),
          path: parentPath,
        },
        name
      );
    }
    let insertAtIndex = parentIndex + 1;
    while (curr[insertAtIndex]?.type === 'var') {
      insertAtIndex += 1;
    }
    return [
      ...curr.slice(0, insertAtIndex),
      name,
      ...curr.slice(insertAtIndex),
    ];
  };

export const catalogItems =
  (editor: MyEditor) =>
  (names: CatalogItemVar[]): CatalogItems =>
    names.reduce<CatalogItems>(catalogItem(editor), []);
