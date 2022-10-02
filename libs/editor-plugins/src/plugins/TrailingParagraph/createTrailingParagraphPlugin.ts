import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import {
  createPluginFactory,
  getLastNodeByLevel,
  getNodeString,
  insertElements,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

export const createTrailingParagraphPlugin = createPluginFactory({
  key: 'PLUGIN_TRAILING_PARAGRAPH',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = ([currentNode, currentPath]) => {
      if (!currentPath.length) {
        const lastChild = getLastNodeByLevel(editor, 0);

        const lastChildNode = lastChild?.[0];

        if (
          !lastChildNode ||
          lastChildNode.type !== ELEMENT_PARAGRAPH ||
          getNodeString(lastChildNode)
        ) {
          const at = lastChild ? Path.next(lastChild[1]) : [0];

          insertElements(
            editor,
            {
              type: ELEMENT_PARAGRAPH,
              id: nanoid(),
              children: [{ text: '' }],
            },
            { at }
          );
          return;
        }
      }

      return normalizeNode([currentNode, currentPath]);
    };

    return editor;
  },
});
