import { Editor, Selection } from 'slate';
import { createPluginFactory } from '@udecode/plate';
import { dequal } from 'dequal';

type OnCursorChangePlugin = (editor: Editor) => (selection: Selection) => void;

export const createOnCursorChangePluginFactory = (
  name: string,
  plugin: OnCursorChangePlugin
): ReturnType<typeof createPluginFactory> =>
  createPluginFactory({
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
