import { BaseEditor, Transforms } from 'slate';
import {
  BlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ParagraphElement,
  RichText,
} from '@decipad/editor-types';
import { tokenize } from '@decipad/computer';
import { pluginStore } from '@decipad/editor-utils';
import { last } from '@decipad/utils';
import {
  getBlockAbove,
  getNodeString,
  isElement,
  setNodes,
} from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

type LastFormattedBlock = null | {
  readonly id: string;
  readonly text: string;
  readonly oldText: string;
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
      const { lastFormattedBlock } = store;
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (!hasModifiers && event.key === '=') {
        const entry = getBlockAbove<BlockElement>(editor);

        if (!entry) return;

        const [node, path] = entry;

        if (node.type !== ELEMENT_PARAGRAPH || node.children.length !== 1) {
          return;
        }

        // Because children.length is 1, we know know there is only a text child
        const paragraph = node as ParagraphElement & { children: [RichText] };

        const nodeText = `${paragraph.children[0].text}=`;

        const tokens = tokenize(nodeText).filter(
          (token) => token.type !== 'ws'
        );

        /*
          1. The length of the node text is 2 to 5 tokens.
          2. The first token has an offset of zero (IE no whitespace precedes it)
          3. 1-4 words are an identifier type (not a number for example).
          4. The last word is an equal sign.
        */
        const isEqualSignAfterFewWords =
          tokens.length >= 2 &&
          tokens.length <= 5 &&
          tokens[0].offset === 0 &&
          tokens
            .slice(0, -1)
            .every(
              (t) => t.type === 'identifier' || t.type?.endsWith('keyword')
            ) &&
          last(tokens)?.type === 'equalSign';

        /*
          1. Total length of the node text is only one token (character or word).
          2. That token is an equal sign.
          3. The equal sign has an offset of 0 meaning that is has no empty space before it.
        */
        const isEqualAtTheStart =
          tokens.length === 1 &&
          tokens[0].type === 'equalSign' &&
          tokens[0].offset === 0;

        if (isEqualSignAfterFewWords || isEqualAtTheStart) {
          event.preventDefault();

          const text = isEqualSignAfterFewWords
            ? nodeText.replaceAll(/\s+(?!=)/g, '_')
            : '';

          setNodes(editor, { type: ELEMENT_CODE_LINE });
          Transforms.insertText(editor as BaseEditor, text, { at: path });

          store.lastFormattedBlock = {
            id: node.id,
            oldText: nodeText,
            text,
          };
        }
      } else if (!hasModifiers && event.key === 'Backspace') {
        const entry = getBlockAbove<CodeLineElement>(editor, {
          match: (n) => isElement(n) && n.type === ELEMENT_CODE_LINE,
        });

        if (!entry) return;

        const [node, path] = entry;

        const nodeText = getNodeString(node);

        if (
          lastFormattedBlock &&
          node.id === lastFormattedBlock.id &&
          nodeText === lastFormattedBlock.text
        ) {
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });
          Transforms.insertText(
            editor as BaseEditor,
            lastFormattedBlock.oldText,
            { at: path }
          );

          delete store.lastFormattedBlock;
        } else if (nodeText === '') {
          // Empty code blocks get turned into a paragraph when backspace is pressed
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });
        }
      } else {
        delete store.lastFormattedBlock;
      }
    };
  },
});
