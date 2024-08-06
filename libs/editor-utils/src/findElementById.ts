import type { FindNodeOptions, TNodeEntry } from '@udecode/plate-common';
import { findNode } from '@udecode/plate-common';
import type { AnyElement, MyEditor, MyValue } from '@decipad/editor-types';

export const findElementById = <T extends AnyElement>(
  editor: MyEditor,
  id: string,
  options: Omit<FindNodeOptions<MyValue>, 'match'> = {}
): TNodeEntry<T> | undefined => {
  return findNode<AnyElement>(editor, {
    match: { id },
    at: [],
    ...options,
  }) as TNodeEntry<T>;
};
