import { MyEditor, MyValue } from '@decipad/editor-types';
import { findNode, getNodeString } from '@udecode/plate';
import { NodeEntry, Path } from 'slate';
import { CatalogHeadingItem, CatalogItems, CatalogItemVar } from './types';
import { findParent } from './findParent';

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
      return insertInOrder(
        curr,
        {
          type: parentNode.type,
          blockId: parentNode.id,
          name: getNodeString(parentNode),
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
