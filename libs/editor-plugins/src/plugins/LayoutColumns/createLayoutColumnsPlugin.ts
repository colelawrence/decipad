/* eslint-disable no-param-reassign */
import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_COLUMNS } from '@decipad/editor-types';
import { Columns } from '@decipad/editor-components';

export const createLayoutColumnsPlugin = createPluginFactory({
  key: ELEMENT_COLUMNS,
  isElement: true,
  component: Columns,
});
