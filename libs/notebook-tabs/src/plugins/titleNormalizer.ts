import { isElement } from '@udecode/plate';
import {
  ELEMENT_TITLE,
  ELEMENT_H1,
  createTPluginFactory,
  NotebookValue,
} from '@decipad/editor-types';
import cloneDeep from 'lodash.clonedeep';
import omit from 'lodash.omit';
import { nanoid } from 'nanoid';

export const createTitleNormalizer = createTPluginFactory<{}, NotebookValue>({
  key: 'TITLE_NORMALIZER',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [node, path] = entry;
      if (isElement(node) && path[0] === 0) {
        if (node.type === ELEMENT_H1) {
          editor.apply({
            type: 'set_node',
            path,
            properties: omit(cloneDeep(node), 'children'),
            newProperties: {
              id: node.id,
              type: ELEMENT_TITLE,
            },
          });
          return;
        }
        if (node.type !== ELEMENT_TITLE) {
          editor.apply({
            type: 'insert_node',
            path: [0],
            node: {
              type: ELEMENT_TITLE,
              id: nanoid(),
              children: [
                {
                  text: 'Welcome to Decipad!',
                },
              ],
            },
          });
          return;
        }
      }
      return normalizeNode(entry);
    };
    return editor;
  },
});
