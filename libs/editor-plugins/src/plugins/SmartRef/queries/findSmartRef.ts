import { findNode, FindNodeOptions, getPluginType } from '@udecode/plate';
import {
  ELEMENT_SMART_REF,
  MyEditor,
  MyValue,
  SmartRefElement,
} from '@decipad/editor-types';

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
