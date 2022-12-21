import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  MyElement,
} from '@decipad/editor-types';
import { useEditorChangeState } from '@decipad/react-contexts';
import { getNextNode, isElement, getPreviousNode } from '@udecode/plate';
import { ReactEditor } from 'slate-react';
import { Path } from 'slate';

export const useSiblingCodeLines = (element: MyElement) =>
  useEditorChangeState(
    (editor) => {
      const currentPath = ReactEditor.findPath(editor as ReactEditor, element);
      const isNearbyVisibleCodeLine = (n: unknown, p: Path) =>
        isElement(n) &&
        (n.type === ELEMENT_CODE_LINE || n.type === ELEMENT_CODE_LINE_V2) &&
        (Path.equals(Path.next(currentPath), p) ||
          Path.equals(Path.previous(currentPath), p));

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
    },
    { hasNext: false, hasPrevious: false }
  );
