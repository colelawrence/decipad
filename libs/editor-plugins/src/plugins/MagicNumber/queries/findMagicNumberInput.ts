import type { FindNodeOptions } from '@udecode/plate-common';
import { findNode, getPluginType } from '@udecode/plate-common';
import type { MyEditor, MyValue } from '@decipad/editor-types';
import { MARK_MAGICNUMBER } from '@decipad/editor-types';

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
