import { type MinimalRootEditor } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import {
  PlateEditor,
  PlatePlugin,
  TNode,
  createPlateEditor,
  getNode,
} from '@udecode/plate';
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
