/* eslint-disable @typescript-eslint/no-explicit-any */

import { type MyEditor } from '@decipad/editor-types';
import { type Path } from 'slate';
import { hasLayoutAncestor } from './layout';

export const isDragAndDropHorizontal = (
  deleted: boolean,
  editor: MyEditor,
  path?: Path
): boolean | undefined => {
  return !deleted && path && hasLayoutAncestor(editor, path);
};
