import { createPluginFactory, TEditor } from '@udecode/plate';

interface CreateOverrideApplyPluginFactoryProps {
  name: string;
  plugin: (editor: TEditor, oldApply: TEditor['apply']) => TEditor['apply'];
}

export const createOverrideApplyPluginFactory = ({
  name,
  plugin,
}: CreateOverrideApplyPluginFactoryProps): ReturnType<
  typeof createPluginFactory
> =>
  createPluginFactory({
    key: name,
    withOverrides: (editor) => {
      const { apply } = editor;
      const overrideApply = plugin(editor, apply);
      // eslint-disable-next-line no-param-reassign
      editor.apply = (op) => overrideApply(op);
      return editor;
    },
  });
