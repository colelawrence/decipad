import { MyPlatePlugin } from '@decipad/editor-types';

export const createWithDocSyncHistoryPlugin = (): MyPlatePlugin => ({
  key: 'WITH_DOC_SYNC_HISTORY_PLUGIN',
  handlers: {
    onKeyDown: (editor) => (event) => {
      if (event.ctrlKey && event.key === 'z') {
        if (!event.shiftKey) {
          editor.undo();
        } else {
          editor.redo();
        }
      }
    },
  },
});
