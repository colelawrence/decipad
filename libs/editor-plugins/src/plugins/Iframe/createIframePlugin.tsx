import { IframeEmbed } from '@decipad/editor-components';
import { ELEMENT_IFRAME, createTPluginFactory } from '@decipad/editor-types';

export const createIframePlugin = createTPluginFactory({
  key: ELEMENT_IFRAME,
  isElement: true,
  isVoid: true,
  component: IframeEmbed,
});
