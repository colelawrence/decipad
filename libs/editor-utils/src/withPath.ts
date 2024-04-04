import type { Path } from 'slate';
import { findNodePath } from '@udecode/plate-common';
import type { MyEditor, MyElement } from '@decipad/editor-types';

type WithPathFunction = (path: Path) => void;

export const withPath = (
  editor: MyEditor,
  element: MyElement | null | undefined,
  fn: WithPathFunction
): void => {
  if (element) {
    const path = findNodePath(editor, element);
    if (path) {
      fn(path);
    }
  }
};
