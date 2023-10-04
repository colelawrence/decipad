import { ELEMENT_CODE_LINE, MyElement } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/editor-hooks';
import {
  getNextNode,
  isElement,
  getPreviousNode,
  findNodePath,
  getPreviousPath,
} from '@udecode/plate';
import { Path } from 'slate';

export const useSiblingCodeLines = (element: MyElement) =>
  useEditorChange((editor) => {
    const currentPath = findNodePath(editor, element);
    const isNearbyVisibleCodeLine = (n: unknown, p: Path) => {
      const previousPath = currentPath && getPreviousPath(currentPath);
      return (
        currentPath != null &&
        isElement(n) &&
        n.type === ELEMENT_CODE_LINE &&
        (Path.equals(Path.next(currentPath), p) ||
          Path.equals(previousPath ?? [], p))
      );
    };

    return {
      hasNext: !!getNextNode<MyElement>(editor, {
        at: currentPath,
        match: isNearbyVisibleCodeLine,
      }),
      hasPrevious: !!getPreviousNode<MyElement>(editor, {
        at: currentPath,
        match: isNearbyVisibleCodeLine,
      }),
    };
  });
