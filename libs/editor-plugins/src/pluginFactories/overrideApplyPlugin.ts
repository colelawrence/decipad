import { createTPluginFactory, MyEditor } from '@decipad/editor-types';

interface CreateOverrideApplyPluginFactoryProps {
  name: string;
  plugin: (editor: MyEditor, oldApply: MyEditor['apply']) => MyEditor['apply'];
}

export const createOverrideApplyPluginFactory = ({
  name,
  plugin,
}: CreateOverrideApplyPluginFactoryProps) =>
  createTPluginFactory({
    key: name,
    withOverrides: (editor) => {
      const { apply } = editor;
      const overrideApply = plugin(editor, apply);
      // eslint-disable-next-line no-param-reassign
      editor.apply = (op) => overrideApply(op);
      return editor;
    },
  });
