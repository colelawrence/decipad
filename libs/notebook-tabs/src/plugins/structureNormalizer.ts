import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  createTPluginFactory,
  NotebookValue,
  ELEMENT_PARAGRAPH,
  AnyElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { IsTab } from '../utils';
import { ELEMENT_H1, isElement, withoutNormalizing } from '@udecode/plate';

export const createStructureNormalizer = createTPluginFactory<
  {},
  NotebookValue
>({
  key: 'STRUCTURE_NORMALIZER',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [node, path] = entry;
      let modified = false;

      if (path.length === 0) {
        const title = editor.children[0] as AnyElement;
        if (
          !title ||
          (isElement(title) &&
            title.type !== ELEMENT_H1 &&
            title.type !== ELEMENT_TITLE)
        ) {
          modified = true;
          editor.apply({
            type: 'insert_node',
            path: [0],
            node: {
              type: ELEMENT_TITLE,
              id: nanoid(),
              children: [{ text: 'Welcome to Decipad!' }],
            },
          });
        }

        if (editor.children.length < 2) {
          modified = true;
          editor.apply({
            type: 'insert_node',
            path: [1],
            node: {
              id: nanoid(),
              type: ELEMENT_TAB,
              name: 'First tab',
              icon: undefined,
              isHidden: undefined,
              children: [
                {
                  id: nanoid(),
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: '' }],
                },
              ],
            },
          });
        }
      }
      if (modified) {
        return;
      }

      if (path.length === 1 && path[0] > 0) {
        if (!IsTab(node)) {
          let tabChildIndex = editor.children.findIndex(IsTab);
          const foundTabChildAtFirst = tabChildIndex >= 0;
          withoutNormalizing(editor, () => {
            if (!foundTabChildAtFirst) {
              editor.apply({
                type: 'insert_node',
                path: [1],
                node: {
                  id: nanoid(),
                  type: ELEMENT_TAB,
                  icon: undefined,
                  isHidden: undefined,
                  name: 'First tab',
                  children: [
                    {
                      id: nanoid(),
                      type: ELEMENT_PARAGRAPH,
                      children: [{ text: '' }],
                    },
                  ],
                },
              });
              tabChildIndex = 1;
            }
            editor.apply({
              type: 'move_node',
              path: [path[0] + (foundTabChildAtFirst ? 0 : 1)],
              newPath: [tabChildIndex, 0],
            });
          });
          return;
        }
      }
      return normalizeNode(entry);
    };
    return editor;
  },
});
