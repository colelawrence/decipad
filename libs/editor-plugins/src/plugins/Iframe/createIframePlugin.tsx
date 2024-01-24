import { IframeEmbed } from '@decipad/editor-components';
import { createMyPluginFactory, ELEMENT_IFRAME } from '@decipad/editor-types';

export const createIframePlugin = createMyPluginFactory({
  key: ELEMENT_IFRAME,
  isElement: true,
  isVoid: true,
  component: IframeEmbed,
});
