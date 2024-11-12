import { Editor, Element, Text, Path } from 'slate';
import {
  ELEMENT_DATA_TAB,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  DataTabElement,
  TabElement,
  TitleElement,
  ELEMENT_CALLOUT,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_LIC,
  ELEMENT_UL,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_BLOCKQUOTE,
  MARK_MAGICNUMBER,
  PlainText,
  DataTabChildrenElement,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_WORKSPACE_RESULT,
  DataTabWorkspaceResultElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { IsDataTab, IsTab, IsTitle } from '../utils';
import {
  type TNodeEntry,
  type TEditor,
  isEditor,
  isElement,
  Value,
} from '@udecode/plate-common';
import { getExprRef, isExprRef } from '@decipad/computer';
import { assert, generatedNames } from '@decipad/utils';
import { isFirstOfOldNodes } from './utils';
import { DATA_TAB_INDEX, FIRST_TAB_INDEX } from '../constants';

type NormalizePlugin = (entry: TNodeEntry) => boolean;
type CurriedNormalizePlugin = <T extends Value = Value>(
  editor: TEditor<T>
) => NormalizePlugin;
type CurriedNormalizerPluginWithIdGenerator = (
  editor: TEditor,
  idGenerator: () => string
) => NormalizePlugin;

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

  const tabIndex = editor.children.findIndex(
    (n: any) => n.type === ELEMENT_TAB
  );

  if (tabIndex === -1) {
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

  if (tabIndex !== FIRST_TAB_INDEX) {
    editor.apply({
      type: 'move_node',
      path: [tabIndex],
      newPath: [FIRST_TAB_INDEX],
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
// Sometimes, we get extra titles. And even rarer, we can get elements inside these
// titles, that shouldnt be there.
//
// We shouldn't just delete them. Instead of should empty out the inside of these titles.
//
const emptyTitleNodes: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node, path] = entry;

  if (isEditor(node)) return false;
  if (!Element.isElement(node) || node.type !== ELEMENT_TITLE) return false;

  if (node.children.length === 0) {
    return false;
  }

  let movingIndex = 1;

  if (!Text.isText(node.children[0])) {
    movingIndex = 0;
  }

  let numOfElementsToMove = node.children.length - movingIndex;

  // This means we only have the text element.
  // and therefore do not need to move anything.
  if (numOfElementsToMove === 0) {
    return false;
  }

  for (; numOfElementsToMove > 0; numOfElementsToMove--) {
    editor.apply({
      type: 'move_node',
      path: [...path, 0],
      newPath: [
        FIRST_TAB_INDEX,
        editor.children[FIRST_TAB_INDEX].children.length,
      ],
    });
  }

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

const normalizeDataTab: CurriedNormalizePlugin = (editor) => (entry) => {
  const [node] = entry;

  if (!isEditor(node)) return false;

  const dataTab = editor.children[DATA_TAB_INDEX];
  assert(dataTab.type === ELEMENT_DATA_TAB, 'unreachable');

  let hasErronousChildren = false;

  // We go backwards, so no shifts in the document occur.
  for (let i = dataTab.children.length - 1; i >= 0; i--) {
    if (
      dataTab.children[i].type === ELEMENT_DATA_TAB_CHILDREN ||
      dataTab.children[i].type === ELEMENT_DATA_TAB_WORKSPACE_RESULT
    ) {
      continue;
    }

    hasErronousChildren = true;

    editor.apply({
      type: 'remove_node',
      path: [DATA_TAB_INDEX, i],
      node: dataTab.children[i],
    });
  }

  return hasErronousChildren;
};

const TEXT_ELEMENTS_WITH_INLINE_NUMBERS = new Set([
  ELEMENT_PARAGRAPH,
  ELEMENT_CALLOUT,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_LIC,
  ELEMENT_UL,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_BLOCKQUOTE,
]);

const isNonExprRefInlineNumber = (node: unknown): boolean => {
  return (
    typeof node === 'object' &&
    node != null &&
    'text' in node &&
    MARK_MAGICNUMBER in node &&
    typeof node.text === 'string' &&
    node[MARK_MAGICNUMBER] === true &&
    !isExprRef(node.text)
  );
};

//
// Migration plugin for inline numbers into the data tab.
// 1. Inline numbers are now purely visual elements, they don't themselves define anything.
// 2. Because of this, we need to migrate any inline number that ISNT a smart ref (exprRef_[a-Z]).
// 3. This needs to be at the tabs level, because we want to migrate them TO the data tab.
//
const migrateInlineNumbers: CurriedNormalizerPluginWithIdGenerator =
  (editor, idGenerator) => (entry) => {
    const [node, path] = entry;

    if (!IsTab(node)) return false;

    const childrenToMigrate: Array<[Path, PlainText]> = [];

    for (const [childIndex, child] of node.children.entries()) {
      if (!TEXT_ELEMENTS_WITH_INLINE_NUMBERS.has(child.type)) {
        continue;
      }

      const childChildren = child.children as Array<PlainText>;

      for (const [inlineIndex, inlineChild] of childChildren.entries()) {
        if (!isNonExprRefInlineNumber(inlineChild)) {
          continue;
        }

        childrenToMigrate.push([[childIndex, inlineIndex], inlineChild]);
      }
    }

    if (childrenToMigrate.length === 0) {
      return false;
    }

    for (const [childPath, content] of childrenToMigrate) {
      const dataTabDefinitionId = idGenerator();

      editor.apply({
        type: 'insert_node',
        path: [DATA_TAB_INDEX, 0],
        node: {
          type: ELEMENT_DATA_TAB_CHILDREN,
          id: dataTabDefinitionId,
          children: [
            {
              id: idGenerator(),
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: generatedNames() }],
            },
            {
              id: idGenerator(),
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [{ text: content.text }],
            },
          ],
        } satisfies DataTabChildrenElement,
      });

      const inlineNumberPath = [...path, ...childPath];

      editor.apply({
        type: 'insert_text',
        path: inlineNumberPath,
        offset: 0,
        text: getExprRef(dataTabDefinitionId),
      });

      editor.apply({
        type: 'remove_text',
        path: inlineNumberPath,
        offset: getExprRef(dataTabDefinitionId).length,
        text: content.text,
      });
    }

    return true;
  };

const preventDuplicateWorkspaceNumber: CurriedNormalizePlugin =
  (editor) => (entry) => {
    const [node] = entry;

    if (!IsDataTab(node)) {
      return false;
    }

    const workspaceNumbers = node.children.filter(
      (c): c is DataTabWorkspaceResultElement =>
        c.type === ELEMENT_DATA_TAB_WORKSPACE_RESULT
    );
    const existingIds = new Set<string>();

    for (const [index, workspaceNumber] of workspaceNumbers.entries()) {
      if (existingIds.has(workspaceNumber.workspaceResultId)) {
        editor.apply({
          type: 'remove_node',
          path: [DATA_TAB_INDEX, index],
          node,
        });

        return true;
      }

      existingIds.add(workspaceNumber.workspaceResultId);
    }

    return false;
  };

export const normalizers = <T extends Value = Value>(
  editor: TEditor<T>,
  idGenerator: () => string = nanoid
): Array<NormalizePlugin> => [
  findOrInsertTitlePlugin(editor),
  ensureDataTab(editor),
  ensureOneTabPlugin(editor),
  migrateOlderNodes(editor),
  ensureParagraphInTab(editor),
  emptyTitleNodes(editor),
  removeExtraTitles(editor),
  normalizeDataTab(editor),
  migrateInlineNumbers(editor, idGenerator),
  preventDuplicateWorkspaceNumber(editor),
];
