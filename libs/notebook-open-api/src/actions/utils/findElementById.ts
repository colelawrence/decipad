import type { TNodeEntry } from '@udecode/plate-common';
import { findNode } from '@udecode/plate-common';
import { notAcceptable } from '@hapi/boom';
import type { AnyElement, MyEditor } from '@decipad/editor-types';

export const findElementById = <T extends AnyElement>(
  editor: MyEditor,
  id: string
): TNodeEntry<T> | undefined => {
  if (typeof id !== 'string') {
    throw notAcceptable('element id should be a string');
  }
  return findNode<AnyElement>(editor, {
    match: { id },
    block: true,
  }) as TNodeEntry<T>;
};
