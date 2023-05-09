/* eslint-disable @typescript-eslint/no-explicit-any */

import { MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';
import { hasLayoutAncestor } from './layout';

export const isDragAndDropHorizontal = (
  deleted: boolean,
  editor: MyEditor,
  path?: Path
): boolean | undefined => {
  return !deleted && path && hasLayoutAncestor(editor, path);
};
