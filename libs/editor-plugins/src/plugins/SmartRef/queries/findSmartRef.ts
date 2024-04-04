import type { FindNodeOptions } from '@udecode/plate-common';
import { findNode, getPluginType } from '@udecode/plate-common';
import type { MyEditor, MyValue, SmartRefElement } from '@decipad/editor-types';
import { ELEMENT_SMART_REF } from '@decipad/editor-types';

export const findSmartRef = (
  editor: MyEditor,
  options?: Omit<FindNodeOptions<MyValue>, 'match'>
) => {
  return findNode<SmartRefElement>(editor, {
    ...options,
    voids: true,
    mode: 'all',
    match: { type: getPluginType(editor, ELEMENT_SMART_REF) },
  });
};
