/* eslint-disable no-param-reassign */
import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_HR } from '@decipad/editor-types';
import { Divider } from '@decipad/editor-components';
import { deserializeDividerHtml } from './deserializeDividerHtml';
import { serializeDividerHtml } from './serializeDividerHtml';

export const createDividerPlugin = createPluginFactory({
  key: ELEMENT_HR,
  isVoid: true,
  isElement: true,
  component: Divider,
  deserializeHtml: deserializeDividerHtml,
  serializeHtml: serializeDividerHtml,
});
