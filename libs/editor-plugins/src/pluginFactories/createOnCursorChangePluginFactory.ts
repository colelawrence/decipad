import type { Selection } from 'slate';
import { dequal } from '@decipad/utils';
import type { MyEditor } from '@decipad/editor-types';
import { createMyPluginFactory } from '@decipad/editor-types';
import type { RemoteComputer } from '@decipad/remote-computer';

type OnCursorChangePlugin = (
  editor: MyEditor,
  computer?: RemoteComputer
) => (selection: Selection) => void;

export const createOnCursorChangePluginFactory = (
  name: string,
  plugin: OnCursorChangePlugin,
  computer?: RemoteComputer
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
