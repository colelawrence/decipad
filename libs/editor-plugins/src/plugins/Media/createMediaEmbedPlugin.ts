import {
  createMediaEmbedPlugin as _createMediaEmbedPlugin,
  getPluginType,
  insertNodes,
  PlateEditor,
  TMediaEmbedElement,
  Value,
} from '@udecode/plate';
import { ELEMENT_MEDIA_EMBED } from '@decipad/editor-types';

export const insertMediaEmbed = <V extends Value>(
  editor: PlateEditor<V>,
  url: string | ArrayBuffer
) => {
  const node: TMediaEmbedElement = {
    type: getPluginType(editor, ELEMENT_MEDIA_EMBED),
    url: url as any,
    children: [{ text: '' }],
  };
  insertNodes<TMediaEmbedElement>(editor, node);
};

export const createMediaEmbedPlugin = () =>
  _createMediaEmbedPlugin({
    withOverrides: (editor, { options }) => {
      const { insertData } = editor;

      // eslint-disable-next-line no-param-reassign
      editor.insertData = (dataTransfer) => {
        const text = dataTransfer.getData('text/plain');

        const { rules } = options;

        if (rules) {
          for (const rule of rules) {
            const parsed = rule.parser(text);

            if (parsed?.provider) {
              insertMediaEmbed(editor, parsed.url!);

              return;
            }
          }
        }

        insertData(dataTransfer);
      };

      return editor;
    },
  });
