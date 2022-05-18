import { findNode, FindNodeOptions, getPluginType } from '@udecode/plate';
import { MARK_MAGICNUMBER, MyEditor, MyValue } from '@decipad/editor-types';

export const findMagicNumberInput = (
  editor: MyEditor,
  options?: Omit<FindNodeOptions<MyValue>, 'match'>
) => {
  return findNode(editor, {
    ...options,
    voids: true,
    mode: 'all',
    match: { type: getPluginType(editor, MARK_MAGICNUMBER) },
  });
};
