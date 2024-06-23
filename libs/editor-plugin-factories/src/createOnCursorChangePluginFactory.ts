import type { Selection } from 'slate';
import type { Computer } from '@decipad/computer-interfaces';
import { dequal } from '@decipad/utils';
import type { MyEditor } from '@decipad/editor-types';
import { createMyPluginFactory } from '@decipad/editor-types';

type OnCursorChangePlugin = (
  editor: MyEditor,
  computer?: Computer
) => (selection: Selection) => void;

export const createOnCursorChangePluginFactory = (
  name: string,
  plugin: OnCursorChangePlugin,
  computer?: Computer
) =>
  createMyPluginFactory({
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
