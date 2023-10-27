import { TNodeEntry, findNode } from '@udecode/plate';
import { notFound, notAcceptable } from '@hapi/boom';
import { matchElementId } from '../../utils/matchElementId';
import {
  AnyElement,
  ELEMENT_TABLE,
  MyEditor,
  TableElement,
} from '@decipad/editor-types';

export const getTableById = (
  editor: MyEditor,
  tableId: string
): TNodeEntry<TableElement> => {
  if (typeof tableId !== 'string') {
    throw notAcceptable('elementId should be a string');
  }
  const entry = findNode<AnyElement>(editor, {
    match: matchElementId(tableId),
  });
  if (!entry) {
    throw notFound(`Could not find a table with id ${tableId}`);
  }
  const [table, tablePath] = entry;
  if (table.type !== ELEMENT_TABLE) {
    throw notAcceptable('Element with given id is not a table');
  }
  return [table, tablePath];
};
