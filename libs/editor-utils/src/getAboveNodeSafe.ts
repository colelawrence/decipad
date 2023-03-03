import { MyNode } from '@decipad/editor-types';
import {
  // eslint-disable-next-line no-restricted-imports
  getAboveNode,
  GetAboveNodeOptions,
  TEditor,
  TNodeEntry,
} from '@udecode/plate';

export const getAboveNodeSafe = <T extends MyNode>(
  editor: TEditor,
  options?: GetAboveNodeOptions
): TNodeEntry<T> | undefined => {
  try {
    return getAboveNode(editor, options) as TNodeEntry<T> | undefined;
  } catch (err) {
    // do nothing
  }
  return undefined;
};
