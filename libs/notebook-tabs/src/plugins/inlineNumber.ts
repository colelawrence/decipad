import {
  createTPluginFactory,
  ELEMENT_INLINE_NUMBER,
  NotebookValue,
} from '@decipad/editor-types';

export const createInlineNumberPlugin = createTPluginFactory<{}, NotebookValue>(
  {
    key: ELEMENT_INLINE_NUMBER,
    type: ELEMENT_INLINE_NUMBER,
    isInline: true,
    isElement: true,
    isVoid: true,
  }
);
