import {
  createTPluginFactory,
  ELEMENT_LINK,
  NotebookValue,
} from '@decipad/editor-types';

export const createInlineLinks = createTPluginFactory<{}, NotebookValue>({
  key: ELEMENT_LINK,
  type: ELEMENT_LINK,
  isInline: true,
  isElement: true,
});
