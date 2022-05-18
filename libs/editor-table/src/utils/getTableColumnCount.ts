import { Path } from 'slate';
import { getNodeChildren, hasNode } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

export const getTableColumnCount = (
  editor: MyEditor,
  tablePath: Path
): number | undefined => {
  const rowPath = [...tablePath, 1];
  if (hasNode(editor, rowPath)) {
    return Array.from(getNodeChildren(editor, rowPath)).length;
  }
  return undefined;
};
