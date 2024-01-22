import { Editor, Element } from 'slate';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { IsTitle } from '../utils';
import {
  type TNodeEntry,
  type TEditor,
  isEditor,
  isElement,
} from '@udecode/plate-common';
import { isFirstOfOldNodes } from './utils';

type NormalizePlugin = (entry: TNodeEntry) => boolean;
type CurriedNormalizePlugin = (editor: TEditor) => NormalizePlugin;

//
// Responsible for either:
// - Finding a good title in the notebook
// - If none can be found, insert a new one
//
const findOrInsertTitlePlugin: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node] = entry;

  if (!Editor.isEditor(node)) return false;

  const titleIndex = editor.children
    .filter((n) => n.type)
    .findIndex((n) => n.type === ELEMENT_TITLE);

  if (titleIndex === -1) {
    editor.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: nanoid(),
        children: [{ text: 'Welcome to Decipad!' }],
      } as any,
    });

    return true;
  }

  if (titleIndex !== 0) {
    //
    // Important Note.
    // Don't move, but delete and create.
    // This is to keep state cleaner in EditorController
    // as it will need to create `titleEditor`
    //

    const title = editor.children[titleIndex] as TitleElement;
    assert(IsTitle(title), 'Should be a title');

    editor.apply({
      type: 'remove_node',
      path: [titleIndex],
      node: title,
    });

    editor.apply({
      type: 'insert_node',
      path: [0],
      node: title,
    });
    return true;
  }

  return false;
};

const ensureOneTabPlugin: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node] = entry;
  if (!Editor.isEditor(node)) return false;

  assert(
    editor.children.length >= 1,
    '`findOrInsertTitlePlugin` should have ran before this, and ensured a title'
  );

  const tab = editor.children.find((n: any) => n.type === ELEMENT_TAB);

  if (tab == null) {
    editor.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: ELEMENT_TAB,
        id: nanoid(),
        name: 'First tab',
        children: [],
      } as any,
    });
    return true;
  }

  return false;
};

const migrateOlderNodes: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node, path] = entry;

  if (isEditor(node)) return false;
  if (!isElement(node)) return false;

  if (node.type === ELEMENT_TITLE || node.type === ELEMENT_TAB) return false;

  if (node.type === ELEMENT_H1 && isFirstOfOldNodes(path)) {
    const oldTitle = node.children[0].text as string;

    editor.apply({
      type: 'remove_node',
      path,
      node,
    });

    const title = editor.children[0] as TitleElement;
    assert(
      title?.type === ELEMENT_TITLE,
      `0th child should always be title. Got ${JSON.stringify(title)}`
    );

    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: title.children[0].text,
    });

    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: oldTitle,
    });
    return true;
  }

  //
  // Any other node present here at the top level.
  // Needs to be moved into the tab (This plugin runs AFTER the ensureOneTabPlugin).
  //

  const tab = editor.children[1] as TabElement;

  // Null chaining, just in case.
  assert(
    tab?.type === ELEMENT_TAB,
    `First element should always be a tab. Got ${JSON.stringify(tab)}`
  );

  editor.apply({
    type: 'move_node',
    path,
    newPath: [1, tab.children.length],
  });

  return true;
};

const ensureParagraphInTab: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node, path] = entry;
  if (!Element.isElement(node)) return false;

  if (node.type !== ELEMENT_TAB) return false;

  if (node.children.length === 0) {
    editor.apply({
      type: 'insert_node',
      path: [...path, 0],
      node: {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      } as any,
    });
    return true;
  }

  return false;
};

const removeExtraTitles: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node, path] = entry;

  if (isEditor(node)) return false;
  if (path[0] === 0) return false;
  if ((node as any).type !== ELEMENT_TITLE) return false;

  //
  // At this point we have title elements.
  // That are not in path 0.
  // Remove them
  //

  editor.apply({
    type: 'remove_node',
    path,
    node,
  });

  return true;
};

export const normalizers = (editor: TEditor): Array<NormalizePlugin> => [
  findOrInsertTitlePlugin(editor),
  ensureOneTabPlugin(editor),
  migrateOlderNodes(editor),
  ensureParagraphInTab(editor),
  removeExtraTitles(editor),
];
