import type { MinimalRootEditor } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import type { TNode } from '@udecode/plate-common';
import { createPlateEditor, getNode } from '@udecode/plate-common';
import type { Path } from 'slate';

export const createMinimalEditor = (): MinimalRootEditor => {
  const editor = createPlateEditor();
  editor.normalizeNode = noop;
  editor.destroy = noop;
  editor.getNode = (path: Path): TNode | null => getNode(editor, path);
  return editor as unknown as MinimalRootEditor;
};
