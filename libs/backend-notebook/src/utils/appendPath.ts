import { MyEditor } from '@decipad/editor-types';
import type { Path } from 'slate';

export const appendPath = (editor: MyEditor): Path => {
  const nextChildIndex = editor.children.length;
  return [nextChildIndex];
};
