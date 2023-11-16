import {
  createTPluginFactory,
  ELEMENT_SMART_REF,
  NotebookValue,
} from '@decipad/editor-types';

export const createSmartRefPlugin = createTPluginFactory<{}, NotebookValue>({
  key: ELEMENT_SMART_REF,
  type: ELEMENT_SMART_REF,
  isInline: true,
  isVoid: true,
  isElement: true,
});
