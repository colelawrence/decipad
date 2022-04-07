/* eslint-disable no-param-reassign */
import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_CALLOUT } from '@decipad/editor-types';
import { Callout } from '@decipad/editor-components';
import { deserializeCalloutHtml } from './deserializeCalloutHtml';
import { serializeCalloutHtml } from './serializeCalloutHtml';

export const createCalloutPlugin = createPluginFactory({
  key: ELEMENT_CALLOUT,
  isElement: true,
  component: Callout,
  deserializeHtml: deserializeCalloutHtml,
  serializeHtml: serializeCalloutHtml,
});
