import { Selection } from 'slate';
import { dequal } from 'dequal';
import { createTPluginFactory, MyEditor } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';

type OnCursorChangePlugin = (
  editor: MyEditor,
  computer?: Computer
) => (selection: Selection) => void;

export const createOnCursorChangePluginFactory = (
  name: string,
  plugin: OnCursorChangePlugin,
  computer?: Computer
) =>
  createTPluginFactory({
    key: name,
    withOverrides: (editor) => {
      const onSelectionChange = plugin(editor, computer);
      const { onChange } = editor;
      const previousSelection: Selection | undefined = undefined;
      // eslint-disable-next-line no-param-reassign
      editor.onChange = () => {
        if (!dequal(previousSelection, editor.selection)) {
          setTimeout(() => onSelectionChange(editor.selection), 0);
        }
        onChange();
      };

      return editor;
    },
  });
