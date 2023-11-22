import {
  isElement,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';
import { Path } from 'slate';
import {
  ColumnsElement,
  ELEMENT_COLUMNS,
  MyEditor,
  MyElementOrText,
} from '@decipad/editor-types';
import { getAboveNodeSafe, insertNodes } from '@decipad/editor-utils';

export const hasLayoutAncestor = (editor: MyEditor, path: Path): boolean => {
  return !!getAboveNodeSafe(editor, {
    at: path,
    match: (node) => isElement(node) && node.type === ELEMENT_COLUMNS,
  });
};

export const insertNodeIntoColumns = (
  editor: MyEditor,
  node: MyElementOrText,
  path: Path
): void => {
  withoutNormalizing(editor, () => {
    const hasLayoutAncestorElement = hasLayoutAncestor(editor, path);
    if (!hasLayoutAncestorElement) {
      wrapNodes(
        editor,
        {
          type: ELEMENT_COLUMNS,
        } as ColumnsElement,
        { at: path }
      );
    }

    insertNodes(editor, [node], {
      at: hasLayoutAncestorElement ? Path.next(path) : [...path, 1],
    });
  });
};
