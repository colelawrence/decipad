import { type MinimalRootEditor } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import {
  createPlateEditor,
  getNode,
  PlateEditor,
  PlatePlugin,
  TNode,
} from '@udecode/plate-common';
import { Path } from 'slate';

export type TestEditorController = PlateEditor & MinimalRootEditor;

export const createTestEditorController = (
  id: string,
  plugins: PlatePlugin[]
): TestEditorController => {
  const editor = createPlateEditor({ id, plugins });
  editor.getNode = (path: Path): TNode | null => {
    return getNode(editor, path);
  };
  editor.destroy = noop;
  return editor as unknown as TestEditorController;
};
