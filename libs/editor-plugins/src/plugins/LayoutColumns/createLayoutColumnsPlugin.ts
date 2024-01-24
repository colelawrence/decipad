/* eslint-disable no-param-reassign */
import { createMyPluginFactory, ELEMENT_COLUMNS } from '@decipad/editor-types';
import { Columns } from './Columns';

export const createLayoutColumnsPlugin = createMyPluginFactory({
  key: ELEMENT_COLUMNS,
  isElement: true,
  component: Columns,
});
