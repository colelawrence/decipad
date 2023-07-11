import { MyPlatePlugin } from '@decipad/editor-types';
import { canDropFile } from '@decipad/editor-components';

export const createAttachmentPlugin = (): MyPlatePlugin => ({
  key: 'attachment',
  handlers: {
    onDragOver: () => (event) => {
      canDropFile(event.dataTransfer);
    },
  },
});
