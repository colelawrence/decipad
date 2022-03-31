import {
  BlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ParagraphElement,
  RichText,
} from '@decipad/editor-types';
import { tokenize } from '@decipad/language';
import { pluginStore } from '@decipad/editor-utils';
import { getBlockAbove, setNodes } from '@udecode/plate';
import { NodeEntry } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

type LastFormattedBlock = null | {
  readonly id: string;
  readonly text: string;
};

interface AutoFormatCodeBlockPluginStore {
  lastFormattedBlock?: LastFormattedBlock;
}

const pluginName = 'AUTO_FORMAT_CODE_BLOCK_PLUGIN';

export const createAutoFormatCodeBlockPlugin = createOnKeyDownPluginFactory({
  name: pluginName,
  plugin: (editor) => {
    return (event) => {
      const store = pluginStore<AutoFormatCodeBlockPluginStore>(
        editor,
        pluginName,
        () => ({})
      );
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (!hasModifiers && event.key === '=') {
        const entry = getBlockAbove(editor);

        if (!entry) return;

        const [node] = entry as NodeEntry<BlockElement>;

        if (node.type !== ELEMENT_PARAGRAPH || node.children.length > 1) return;
        // Because children.length is 0, we know know there is only a text child
        const paragraph = node as ParagraphElement & { children: [RichText] };

        const nodeText = `${paragraph.children[0].text}=`;

        const tokens = tokenize(nodeText).filter(
          (token) => token.type !== 'ws'
        );

        /*
        1. The length of the node text is exactly 2 words.
        2. First word is an identifier type (not a number for example).
        3. The Second word is an equal sign.
        4. The first word has an offset of 0 meaning there is no empty space before it.
      */
        const isEqualSignAfterOneWord =
          tokens.length === 2 &&
          tokens[0].type === 'identifier' &&
          tokens[0].offset === 0 &&
          tokens[1].type === 'equalSign';

        /*
        1. Total length of the node text is only one token (character or word).
        2. That token is an equal sign.
        3. The equal sign has an offset of 0 meaning that is has no empty space before it.
      */
        const isEqualAtTheStart =
          tokens.length === 1 &&
          tokens[0].type === 'equalSign' &&
          tokens[0].offset === 0;

        if (isEqualSignAfterOneWord || isEqualAtTheStart) {
          if (isEqualAtTheStart) {
            event.preventDefault(); // Do not type the = when it's only an equal sign
          }
          setNodes(editor, { type: ELEMENT_CODE_LINE });
          store.lastFormattedBlock = {
            id: node.id,
            text: isEqualSignAfterOneWord
              ? nodeText
              : paragraph.children[0].text,
          };
        }
      } else if (!hasModifiers && event.key === 'Backspace') {
        const entry = getBlockAbove(editor, {
          match: (n) => n.type === ELEMENT_CODE_LINE,
        });

        if (!entry) return;

        const [node, path] = entry as NodeEntry<CodeLineElement>;

        const { lastFormattedBlock } = store;
        if (
          lastFormattedBlock &&
          node.id === lastFormattedBlock.id &&
          node.children[0].text === lastFormattedBlock.text
        ) {
          event.preventDefault();
          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });

          if (!node.children[0].text.endsWith('=')) {
            editor.insertText('=');
          }
          delete store.lastFormattedBlock;
        }
      } else {
        delete store.lastFormattedBlock;
      }
    };
  },
});
