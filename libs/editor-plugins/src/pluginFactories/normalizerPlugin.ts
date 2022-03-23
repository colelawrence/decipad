import { PlateEditor, createPluginFactory, WithOverride } from '@udecode/plate';
import { Editor, NodeEntry } from 'slate';

type NormalizerPlugin = (editor: Editor) => (entry: NodeEntry) => boolean;

const withNormalizerOverride = (plugin: NormalizerPlugin): WithOverride => {
  return (editor: PlateEditor) => {
    const { normalizeNode } = editor;
    const newNormalize = plugin(editor);
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry: NodeEntry) => {
      if (newNormalize(entry)) {
        return;
      }
      return normalizeNode(entry);
    };
    return editor;
  };
};

interface NormalizerPluginProps {
  name: string;
  plugin: NormalizerPlugin;
}

export const createNormalizerPluginFactory = ({
  name,
  plugin,
}: NormalizerPluginProps): ReturnType<typeof createPluginFactory> =>
  createPluginFactory({
    key: name,
    withOverrides: withNormalizerOverride(plugin),
  });
