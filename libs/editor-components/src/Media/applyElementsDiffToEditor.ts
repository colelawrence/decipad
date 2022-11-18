/* eslint-disable no-underscore-dangle */
/* eslint-disable no-prototype-builtins */
import {
  DrawElement,
  DrawElementDescendant,
  MyEditor,
} from '@decipad/editor-types';
import {
  deleteText,
  findNode,
  insertNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { NodeEntry } from 'slate';
import { drawDummyElement } from './drawDummyElement';
import { fixElement } from './fixElement';
import { DrawElementsDiff } from './types';

const removeRemoved = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  removed: Array<string>
): void => {
  let childrenCountAfter = parent[0].children.length;
  for (const r of [...removed].reverse()) {
    const entry = findNode(editor, {
      at: parent[1],
      match: { id: r },
      voids: true,
    });
    if (entry) {
      deleteText(editor, { at: entry[1], unit: 'block', voids: true });
      childrenCountAfter -= 1;
    }
  }

  // if we removed all children we need to add a child otherwise slate
  // will mess up our block
  if (childrenCountAfter === 0) {
    insertNodes(editor, [drawDummyElement()], {
      at: [...parent[1], 0],
      voids: true,
    });
  }
};

const addAdded = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  added: Array<DrawElementDescendant>
): void => {
  for (const a of added) {
    const newElementPath = [...parent[1], parent[0].children.length];
    insertNodes(editor, [fixElement(a)], { at: newElementPath });
  }
};

const modifyModified = (
  editor: MyEditor,
  modified: Array<Partial<DrawElementDescendant>>
): void => {
  for (const m of modified) {
    if (Object.keys(m).length === 0 || m.__dummy) {
      continue;
    }
    const entry = findNode(editor, { match: { id: m.id }, voids: true });
    if (entry) {
      setNodes(editor, fixElement(m), { at: entry[1], voids: true });
    }
  }
};

export const applyElementsDiffToEditor = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  elementsDiff: DrawElementsDiff
) => {
  withoutNormalizing(editor, () => {
    modifyModified(editor, elementsDiff.modified);
    addAdded(editor, parent, elementsDiff.added);
    removeRemoved(editor, parent, elementsDiff.removed);
  });
};
