import { createTPluginFactory, ELEMENT_BUBBLE } from '@decipad/editor-types';
import { InlineBubble } from '@decipad/editor-components';
import { createNormalizeMagicNumbersPlugin } from './plugins';

export const createValueBubblePlugin = createTPluginFactory({
  key: ELEMENT_BUBBLE,
  type: ELEMENT_BUBBLE,
  isInline: true,
  isElement: true,
  isVoid: true,
  component: InlineBubble,
  plugins: [createNormalizeMagicNumbersPlugin()],
});
