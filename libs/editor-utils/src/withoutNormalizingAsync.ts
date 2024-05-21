import type { MyEditor } from '@decipad/editor-types';
import type { BaseEditor } from 'slate';
import { Editor } from 'slate';

export const withoutNormalizingAsync = async (
  editor: MyEditor,
  fn: () => Promise<void>
) => {
  const before = Editor.isNormalizing(editor as BaseEditor);
  Editor.setNormalizing(editor as BaseEditor, false);
  try {
    await fn();
  } finally {
    Editor.setNormalizing(editor as BaseEditor, before);
  }
  Editor.normalize(editor as BaseEditor);
};
