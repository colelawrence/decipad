import { isElement, TEditor, TNode } from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import { ColumnsElement, ELEMENT_COLUMNS } from '@decipad/editor-types';

export const hasLayoutAncestor = (editor: TEditor, path: Path): boolean => {
  return !!Editor.above(editor, {
    at: path,
    match: (node) => isElement(node) && node.type === ELEMENT_COLUMNS,
  });
};

export const insertNodeIntoColumns = (
  editor: TEditor,
  node: TNode,
  path: Path
): void => {
  Editor.withoutNormalizing(editor, () => {
    const hasLayoutAncestorElement = hasLayoutAncestor(editor, path);
    if (!hasLayoutAncestorElement) {
      Transforms.wrapNodes(
        editor,
        {
          type: ELEMENT_COLUMNS,
        } as ColumnsElement,
        { at: path }
      );
    }

    Transforms.insertNodes(editor, node, {
      at: hasLayoutAncestorElement ? Path.next(path) : [...path, 1],
    });
  });
};
