import { Editor, Element } from 'slate';
import {
  ELEMENT_DATA_TAB,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  DataTabElement,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { IsTitle } from '../utils';
import {
  type TNodeEntry,
  type TEditor,
  isEditor,
  isElement,
} from '@udecode/plate-common';
import { isFirstOfOldNodes } from './utils';
import { DATA_TAB_INDEX, FIRST_TAB_INDEX } from '../constants';

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

    if (!IsTitle(title)) {
      throw new Error('Should be a title');
    }

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

//
// Makes sure that there is always at least one tab per notebook.
// After the title.
//
const ensureOneTabPlugin: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node] = entry;
  if (!Editor.isEditor(node)) return false;

  if (editor.children.length < 2) {
    throw new Error(
      'findOrInsertTitlePlugin` should have ran before this, and ensured a title, and `ensureDataTab` as well.'
    );
  }

  const tab = editor.children.find((n: any) => n.type === ELEMENT_TAB);

  if (tab == null) {
    editor.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX],
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

//
// Older notebooks didn't have tabs. They consisted of:
// H1Element, Array<AnyElement>
//
// But now we have everything in tabs, so this takes the old nodes,
// and places them inside a tab.
//
// This plugin should be ran after the `ensureOneTabPlugin`, to that there
// is a tab to move into.
//
const migrateOlderNodes: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node, path] = entry;

  if (isEditor(node)) return false;
  if (!isElement(node)) return false;

  if (
    node.type === ELEMENT_TITLE ||
    node.type === ELEMENT_TAB ||
    node.type === ELEMENT_DATA_TAB
  )
    return false;

  if (node.type === ELEMENT_H1 && isFirstOfOldNodes(path)) {
    const oldTitle = node.children[0].text as string;

    editor.apply({
      type: 'remove_node',
      path,
      node,
    });

    const title = editor.children[0] as TitleElement;

    if (title?.type !== ELEMENT_TITLE) {
      throw new Error(
        `0th child should always be title. Got ${JSON.stringify(title)}`
      );
    }

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

  const tab = editor.children[FIRST_TAB_INDEX] as TabElement;

  // Null chaining, just in case.
  if (tab?.type !== ELEMENT_TAB) {
    throw new Error(
      `First element should always be a tab. Got ${JSON.stringify(tab)}`
    );
  }

  editor.apply({
    type: 'move_node',
    path,
    newPath: [FIRST_TAB_INDEX, tab.children.length],
  });

  return true;
};

//
// Ensures that every tab has at least one paragraph inside.
//
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

//
// Ensures there is at least one data tab per notebook.
// - It will try and find a data tab if one exists and move it to the correct place.
// - It will also remove any extras.
//
const ensureDataTab: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node] = entry;

  if (!isEditor(node)) return false;

  const dataTabs: Array<[number, DataTabElement]> = [];
  for (const [index, child] of editor.children.entries()) {
    if (child.type !== ELEMENT_DATA_TAB) {
      continue;
    }

    dataTabs.push([index, child as DataTabElement]);
  }

  //
  // If no data tabs are found, let's insert a brand new one.
  //
  if (dataTabs.length === 0) {
    editor.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: ELEMENT_DATA_TAB,
        id: nanoid(),
        children: [],
      } satisfies DataTabElement,
    });

    return true;
  }

  //
  // We're all good. Data tab is in the correct place,
  // and we only have one of them.
  //
  if (
    editor.children[DATA_TAB_INDEX].type === ELEMENT_DATA_TAB &&
    dataTabs.length === 1
  ) {
    return false;
  }

  //
  // At this point we guarantee we have at least one data tab.
  // But we could have more, so we have to fix a few problems.
  //

  const [firstTabIndex, firstTab] = dataTabs[0];

  dataTabs.sort(([, a], [, b]) => b.children.length - a.children.length);

  const [index, tabWithMostChildren] = dataTabs[0];

  //
  // Let's look in our sorted list for the data tab with the most children.
  // Because it can happen that multiple data tabs are entered, and we don't want to
  // by accident delete the one that actually contains the information.
  //

  if (tabWithMostChildren.id !== firstTab.id) {
    editor.apply({
      type: 'move_node',
      newPath: [firstTabIndex],
      path: [index],
    });

    return true;
  }

  //
  // The data tab could be in a strange place still.
  //
  if (editor.children[DATA_TAB_INDEX].type !== ELEMENT_DATA_TAB) {
    editor.apply({
      type: 'move_node',
      newPath: [DATA_TAB_INDEX],
      path: [index],
    });

    return true;
  }

  //
  // Now we have the data tabs in the correct place, but still in the document.
  // Let's take the children from every tab that isn't in first place and move them
  // into the correct data tab.
  // Then we can safely delete all the others.
  //
  const dataTabChildrenToMove = dataTabs
    .slice(1)
    .flatMap(([, tab]) => tab.children);

  for (const child of dataTabChildrenToMove) {
    editor.apply({
      type: 'insert_node',
      path: [DATA_TAB_INDEX, 0],
      node: child,
    });
  }

  for (const [i, tab] of dataTabs.slice(1)) {
    if (i === 1) {
      throw new Error(
        'ASSERTION: Should never remove the first data tab at this stage.'
      );
    }

    editor.apply({
      type: 'remove_node',
      path: [i],
      node: tab,
    });
  }

  return true;
};

export const normalizers = (editor: TEditor): Array<NormalizePlugin> => [
  findOrInsertTitlePlugin(editor),
  ensureDataTab(editor),
  ensureOneTabPlugin(editor),
  migrateOlderNodes(editor),
  ensureParagraphInTab(editor),
  removeExtraTitles(editor),
];
