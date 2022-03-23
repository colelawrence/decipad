import { ELEMENT_TABLE_INPUT } from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import { Table } from '@decipad/editor-components';

export const createInteractiveTablePlugin = createPluginFactory({
  key: ELEMENT_TABLE_INPUT,
  isVoid: true,
  isElement: true,
  component: Table,
});
