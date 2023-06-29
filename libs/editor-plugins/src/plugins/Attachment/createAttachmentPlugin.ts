import { MyPlatePlugin } from '@decipad/editor-types';
import { canDropFile } from '@decipad/editor-components';

export const createAttachmentPlugin = (): MyPlatePlugin => ({
  key: 'attachment',
  handlers: {
    onDragOver: () => (event) => {
      // the most permissive plan but this should be handled by react components
      canDropFile(event.dataTransfer, 'pro');
    },
  },
});
