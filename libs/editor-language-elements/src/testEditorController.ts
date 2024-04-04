import { type MinimalRootEditor } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import type { PlatePlugin, TNode } from '@udecode/plate-common';
import { createPlateEditor, getNode } from '@udecode/plate-common';
import type { Path } from 'slate';

export const createTestEditorController = (
  id: string,
  plugins: PlatePlugin[] = []
): MinimalRootEditor => {
  const editor = createPlateEditor({ id, plugins });
  editor.getNode = (path: Path): TNode | null => {
    return getNode(editor, path);
  };
  editor.destroy = noop;
  return editor as unknown as MinimalRootEditor;
};
