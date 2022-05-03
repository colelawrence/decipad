import {
  findNode,
  FindNodeOptions,
  getPluginType,
  PlateEditor,
} from '@udecode/plate';
import { MARK_MAGICNUMBER } from '@decipad/editor-types';

export const findMagicNumberInput = (
  editor: PlateEditor,
  options?: Omit<FindNodeOptions, 'match'>
) => {
  return findNode(editor, {
    ...options,
    voids: true,
    mode: 'all',
    match: { type: getPluginType(editor, MARK_MAGICNUMBER) },
  });
};
