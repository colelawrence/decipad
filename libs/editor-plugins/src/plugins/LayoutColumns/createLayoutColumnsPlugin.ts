/* eslint-disable no-param-reassign */
import { createTPluginFactory, ELEMENT_COLUMNS } from '@decipad/editor-types';
import { Columns } from './Columns';

export const createLayoutColumnsPlugin = createTPluginFactory({
  key: ELEMENT_COLUMNS,
  isElement: true,
  component: Columns,
});
