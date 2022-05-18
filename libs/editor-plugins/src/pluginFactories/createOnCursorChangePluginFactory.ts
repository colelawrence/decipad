import { Selection } from 'slate';
import { dequal } from 'dequal';
import { createTPluginFactory, MyEditor } from '@decipad/editor-types';

type OnCursorChangePlugin = (
  editor: MyEditor
) => (selection: Selection) => void;

export const createOnCursorChangePluginFactory = (
  name: string,
  plugin: OnCursorChangePlugin
) =>
  createTPluginFactory({
    key: name,
    withOverrides: (editor) => {
      const onSelectionChange = plugin(editor);
      const { onChange } = editor;
      const previousSelection: Selection | undefined = undefined;
      // eslint-disable-next-line no-param-reassign
      editor.onChange = () => {
        if (!dequal(previousSelection, editor.selection)) {
          onSelectionChange(editor.selection);
        }
        onChange();
      };

      return editor;
    },
  });
