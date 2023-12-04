import { createTPluginFactory, ELEMENT_SMART_REF } from '@decipad/editor-types';

export const createSmartRefPluginNoUI = createTPluginFactory({
  key: ELEMENT_SMART_REF,
  type: ELEMENT_SMART_REF,
  isInline: true,
  isVoid: true,
  isElement: true,
});
