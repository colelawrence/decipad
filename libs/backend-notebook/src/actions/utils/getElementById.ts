import { TNodeEntry, findNode } from '@udecode/plate';
import { notFound, notAcceptable } from '@hapi/boom';
import { matchElementId } from '../../utils/matchElementId';
import { AnyElement, MyEditor } from '@decipad/editor-types';

export const getElementById = <T extends AnyElement>(
  editor: MyEditor,
  id: string,
  type?: T['type']
): TNodeEntry<T> => {
  if (typeof id !== 'string') {
    throw notAcceptable('element id should be a string');
  }
  const entry = findNode<AnyElement>(editor, {
    match: matchElementId(id),
  });
  if (!entry) {
    throw notFound(`Could not find an element with id ${id}`);
  }
  const [element, path] = entry;
  if (type && element.type !== type) {
    throw notAcceptable('Element with given id is not a table');
  }
  return [element as T, path];
};
