import { MyPlatePlugin } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import {
  ELEMENT_H1,
  getNodeEntry,
  getNodeString,
  hasNode,
} from '@udecode/plate';
import { debounce } from 'lodash';
import { createEventInterceptorPluginFactory } from '../../pluginFactories';

export interface UseNotebookTitlePluginOptions {
  readOnly: boolean;
  notebookTitle?: string;
  onNotebookTitleChange?: (newValue: string) => void;
}

const key = 'ON_CHANGE_NOTEBOOK_TITLE_PLUGIN';

export const createNotebookTitlePlugin = ({
  readOnly,
  notebookTitle = '',
  onNotebookTitleChange = noop,
}: UseNotebookTitlePluginOptions): MyPlatePlugin => ({
  key,
  withOverrides: (editor) => {
    const onNotebookTitleChangeDebounced = debounce(
      onNotebookTitleChange,
      1000
    );

    const { onChange } = editor;
    let lastNotebookTitle = notebookTitle;

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      onChange();
      if (!readOnly) {
        try {
          if (hasNode(editor, [0, 0])) {
            const [node] = getNodeEntry(editor, [0, 0]);
            const newTitle = getNodeString(node);

            if (newTitle !== lastNotebookTitle) {
              lastNotebookTitle = newTitle;
              onNotebookTitleChangeDebounced(newTitle);
            }
          }
        } catch (err) {
          console.error('Error in onChangeNotebookTitle', err);
        }
      }
    };
    return editor;
  },
  plugins: [
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_TITLE',
      elementTypes: [ELEMENT_H1],
      interceptor: () => {
        return true;
      },
    })(),
  ],
});
