import { isElement, withoutNormalizing, wrapNodes } from '@udecode/plate';
import { Path } from 'slate';
import {
  ColumnsElement,
  ELEMENT_COLUMNS,
  MyEditor,
  MyElementOrText,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { insertNodes } from './insertNodes';
import { getAboveNodeSafe } from './getAboveNodeSafe';

export const hasLayoutAncestor = (editor: MyEditor, path: Path): boolean => {
  return !!getAboveNodeSafe(editor, {
    at: path,
    match: (node) => isElement(node) && node.type === ELEMENT_COLUMNS,
  });
};

export const wrapIntoColumns = (editor: MyEditor, path: Path) => {
  const hasLayoutAncestorElement = hasLayoutAncestor(editor, path);
  if (!hasLayoutAncestorElement) {
    wrapNodes(
      editor,
      {
        id: nanoid(),
        type: ELEMENT_COLUMNS,
      } as ColumnsElement,
      { at: path }
    );
  }
};

export const insertNodeIntoColumns = (
  editor: MyEditor,
  node: MyElementOrText,
  path: Path
): void => {
  withoutNormalizing(editor, () => {
    const hasLayoutAncestorElement = hasLayoutAncestor(editor, path);
    if (!hasLayoutAncestorElement) {
      wrapIntoColumns(editor, path);
    }

    insertNodes(editor, node, {
      at: hasLayoutAncestorElement ? Path.next(path) : [...path, 1],
    });
  });
};
