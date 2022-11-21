import { MyEditor, MyValue } from '@decipad/editor-types';
import { findNode, getNodeString } from '@udecode/plate';
import { NodeEntry } from 'slate';
import { CatalogItemsReturnType, CatalogItemVar } from './types';
import { findParent } from './findParent';

const catalogItem =
  (editor: MyEditor) =>
  (
    curr: CatalogItemsReturnType,
    name: CatalogItemVar
  ): CatalogItemsReturnType => {
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

    const parentIndex = curr.findIndex((el) => el.blockId === parent.id);
    if (parentIndex < 0) {
      return [
        ...curr,
        {
          type: parent.type,
          blockId: parent.id,
          name: getNodeString(parent),
        },
        name,
      ];
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
  (names: CatalogItemVar[]): CatalogItemsReturnType =>
    names.reduce<CatalogItemsReturnType>(catalogItem(editor), []);
