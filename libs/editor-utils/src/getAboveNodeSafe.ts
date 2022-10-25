import { MyEditor } from '@decipad/editor-types';
import { getAboveNode, GetAboveNodeOptions } from '@udecode/plate';

export const getAboveNodeSafe = (
  editor: MyEditor,
  options?: GetAboveNodeOptions
) => {
  try {
    return getAboveNode(editor, options);
  } catch (err) {
    // do nothing
  }
  return undefined;
};
