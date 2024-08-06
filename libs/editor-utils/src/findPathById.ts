import type { MyEditor } from '@decipad/editor-types';
import { findElementById } from './findElementById';
import type { Path } from 'slate';

export const findPathById = (
  editor: MyEditor,
  id: string
): Path | undefined => {
  const entry = findElementById(editor, id);
  if (!entry) return;
  return entry[1];
};
