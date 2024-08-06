import type { TNodeEntry } from '@udecode/plate-common';
import { notAcceptable, notFound } from '@hapi/boom';
import type { AnyElement, MyEditor } from '@decipad/editor-types';
import { findElementById } from '@decipad/editor-utils';
import { validateId } from './validateId';

export const getElementById = <T extends AnyElement>(
  editor: MyEditor,
  id: string,
  type?: T['type']
): TNodeEntry<T> => {
  validateId(id);
  const entry = findElementById<AnyElement>(editor, id, { block: true });
  if (!entry) {
    throw notFound(`Could not find an element with id ${id}`);
  }
  const [element, path] = entry;
  if (type && element.type !== type) {
    throw notAcceptable(`Element with given id is not a ${type}`);
  }
  return [element as T, path];
};
