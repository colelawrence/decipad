import { MyPlatePlugin } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { getNodeEntry, getNodeString } from '@udecode/plate';
import { debounce } from 'lodash';

export interface UseNotebookTitlePluginOptions {
  readOnly: boolean;
  notebookTitle?: string;
  onNotebookTitleChange?: (newValue: string) => void;
}

export const createNotebookTitlePlugin = ({
  readOnly,
  notebookTitle = '',
  onNotebookTitleChange = noop,
}: UseNotebookTitlePluginOptions): MyPlatePlugin => ({
  key: 'ON_CHANGE_NOTEBOOK_TITLE_PLUGIN',
  handlers: {
    onChange: (editor) => {
      const onNotebookTitleChangeDebounced = debounce(
        onNotebookTitleChange,
        1000
      );
      let lastNotebookTitle = notebookTitle;
      return () => {
        if (!readOnly) {
          try {
            const [node] = getNodeEntry(editor, [0, 0]);
            const newTitle = getNodeString(node);

            if (newTitle !== lastNotebookTitle) {
              lastNotebookTitle = newTitle;
              onNotebookTitleChangeDebounced(newTitle);
            }
          } catch (err) {
            console.error('Error in onChangeNotebookTitle', err);
          }
        }
      };
    },
  },
});
