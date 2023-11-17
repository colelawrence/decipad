import {
  ELEMENT_PARAGRAPH,
  isElement,
  isText,
  withoutNormalizing,
} from '@udecode/plate';
import {
  createTPluginFactory,
  NotebookValue,
  ELEMENT_TAB,
} from '@decipad/editor-types';

export const createTabNormalizer = createTPluginFactory<{}, NotebookValue>({
  key: 'TITLE_NORMALIZER',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [node, path] = entry;
      if (isElement(node) && node.type === ELEMENT_TAB) {
        let madeChanges = false;
        if (node.children.length === 0) {
          madeChanges = true;
          editor.apply({
            type: 'insert_node',
            path: [...path, 0],
            node: {
              type: ELEMENT_PARAGRAPH,
              children: [{ text: '' }],
            },
          });
        }
        if (isText(node.children[0])) {
          madeChanges = true;
          withoutNormalizing(editor, () => {
            editor.apply({
              type: 'remove_node',
              path: [...path, 0],
              node: node.children[0],
            });
            editor.apply({
              type: 'insert_node',
              path: [...path, 0],
              node: {
                type: ELEMENT_PARAGRAPH,
                children: [{ text: '' }],
              },
            });
          });
        }
        if (madeChanges) {
          return;
        }
      }
      return normalizeNode(entry);
    };
    return editor;
  },
});
