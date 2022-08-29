import {
  createTPluginFactory,
  ELEMENT_INLINE_NUMBER,
} from '@decipad/editor-types';
import { InlineNumber } from '@decipad/editor-components';
import { createNormalizeMagicNumbersPlugin } from './plugins';

export const createInlineNumberPlugin = createTPluginFactory({
  key: ELEMENT_INLINE_NUMBER,
  type: ELEMENT_INLINE_NUMBER,
  isInline: true,
  isElement: true,
  component: InlineNumber,
  plugins: [createNormalizeMagicNumbersPlugin()],
});
