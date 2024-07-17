import type { TMediaEmbedElement } from '@udecode/plate-media';
import {
  createMediaEmbedPlugin as _createMediaEmbedPlugin,
  parseTwitterUrl,
  parseVideoUrl,
} from '@udecode/plate-media';

import type { PlateEditor, Value } from '@udecode/plate-common';
import { getPluginType } from '@udecode/plate-common';
import { ELEMENT_MEDIA_EMBED } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { insertNodes } from '@decipad/editor-utils';

export const insertMediaEmbed = <V extends Value>(
  editor: PlateEditor<V>,
  url: string | ArrayBuffer
) => {
  const node: TMediaEmbedElement = {
    id: nanoid(),
    type: getPluginType(editor, ELEMENT_MEDIA_EMBED),
    url: url as any,
    children: [{ text: '' }],
  };
  insertNodes<TMediaEmbedElement>(editor, [node]);
};

export const createMediaEmbedPlugin = () =>
  _createMediaEmbedPlugin({
    withOverrides: (editor: PlateEditor) => {
      const { insertData } = editor;

      // eslint-disable-next-line no-param-reassign
      editor.insertData = (dataTransfer) => {
        const text = dataTransfer.getData('text/plain');

        const parsed = parseVideoUrl(text) || parseTwitterUrl(text);

        if (parsed?.provider) {
          insertMediaEmbed(editor, parsed.url!);
          return;
        }

        insertData(dataTransfer);
      };

      return editor;
    },
  });
