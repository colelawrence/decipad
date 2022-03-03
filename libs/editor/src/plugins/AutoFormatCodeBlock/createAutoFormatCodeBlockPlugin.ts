import { tokenize } from '@decipad/language';
import {
  getBlockAbove,
  PlatePlugin,
  setNodes,
  unwrapCodeBlock,
} from '@udecode/plate';
import { ELEMENT_CODE_BLOCK, ELEMENT_PARAGRAPH } from '../../elements';

type LastFormattedBlock = null | {
  readonly id: string;
  readonly text: string;
};

export const createAutoFormatCodeBlockPlugin = (): PlatePlugin => {
  let lastFormattedBlock: LastFormattedBlock = null;
  return {
    onKeyDown: (editor) => (event) => {
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (!hasModifiers && event.key === '=') {
        const entry = getBlockAbove(editor);

        if (!entry) return;

        const [node] = entry;

        if (node.type !== ELEMENT_PARAGRAPH || node.children.length > 1) return;

        const nodeText = `${node.children[0].text}=`;

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
          isEqualAtTheStart && event.preventDefault(); // Do not type the = when it's only an equal sign
          setNodes(editor, { type: ELEMENT_CODE_BLOCK });
          lastFormattedBlock = {
            id: node.id,
            text: isEqualSignAfterOneWord ? nodeText : node.children[0].text,
          };
        }
      } else if (!hasModifiers && event.key === 'Backspace') {
        const entry = getBlockAbove(editor, {
          match: (n) => n.type === ELEMENT_CODE_BLOCK,
        });

        if (!entry) return;

        const [node, path] = entry;

        if (
          lastFormattedBlock &&
          node.id === lastFormattedBlock.id &&
          node.children[0].children[0].text === lastFormattedBlock.text
        ) {
          event.preventDefault();
          unwrapCodeBlock(editor);
          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });

          if (lastFormattedBlock === null) editor.insertText('=');

          lastFormattedBlock = null;
        }
      } else {
        lastFormattedBlock = null;
      }
    },
  };
};
