import { ParagraphElement } from '@decipad/editor-types';
import {
  createPluginFactory,
  getNodeString,
  insertNodes,
  isEditor,
} from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { nanoid } from 'nanoid';

export const createTrailingParagraphPlugin = createPluginFactory({
  key: 'PLUGIN_TRAILING_PARAGRAPH',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      if (!isEditor(entry[0])) {
        return normalizeNode(entry);
      }

      const lastChild = editor.children.at(-1);
      if (
        lastChild?.type === ELEMENT_PARAGRAPH &&
        getNodeString(lastChild.children[0]).trim().length === 0
      ) {
        return normalizeNode(entry);
      }

      insertNodes(
        editor,
        {
          id: nanoid(),
          type: 'p',
          children: [{ text: '' }],
        } satisfies ParagraphElement,
        { at: [editor.children.length] }
      );
    };

    return editor;
  },
});
