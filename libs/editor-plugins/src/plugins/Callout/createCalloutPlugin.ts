import { createMyPluginFactory, ELEMENT_CALLOUT } from '@decipad/editor-types';
import { Callout } from '@decipad/editor-components';
import { deserializeCalloutHtml } from './deserializeCalloutHtml';
import { serializeCalloutHtml } from './serializeCalloutHtml';

export const createCalloutPlugin = createMyPluginFactory({
  key: ELEMENT_CALLOUT,
  isElement: true,
  component: Callout,
  deserializeHtml: deserializeCalloutHtml,
  serializeHtml: serializeCalloutHtml,
});
