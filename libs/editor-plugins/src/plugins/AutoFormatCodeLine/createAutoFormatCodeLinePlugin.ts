import { BaseEditor, Transforms } from 'slate';
import {
  BlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ParagraphElement,
  RichText,
} from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import {
  getBlockAbove,
  getNodeString,
  isElement,
  setNodes,
} from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

type LastFormattedBlock = null | {
  readonly id: string;
  readonly oldText: string;
};

interface AutoFormatCodeLinePluginStore {
  lastFormattedBlock?: LastFormattedBlock;
}

const pluginName = 'AUTO_FORMAT_CODE_LINE_PLUGIN';

export const createAutoFormatCodeLinePlugin = createOnKeyDownPluginFactory({
  name: pluginName,
  plugin: (editor) => {
    return (event) => {
      const store = pluginStore<AutoFormatCodeLinePluginStore>(
        editor,
        pluginName,
        () => ({})
      );
      const { lastFormattedBlock } = store;
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (!hasModifiers && event.key === '=') {
        const entry = getBlockAbove<BlockElement>(editor);

        if (!entry) return;

        const [node] = entry;

        if (node.type !== ELEMENT_PARAGRAPH || node.children.length !== 1) {
          return;
        }

        // Because children.length is 1, we know know there is only a text child
        const paragraph = node as ParagraphElement & { children: [RichText] };

        const nodeText = `${getNodeString(paragraph)}=`;

        if (nodeText.trim() === '=') {
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_CODE_LINE });

          store.lastFormattedBlock = {
            id: node.id,
            oldText: nodeText,
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
          nodeText === ''
        ) {
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });
          Transforms.insertText(
            editor as BaseEditor,
            lastFormattedBlock.oldText,
            { at: path }
          );

          delete store.lastFormattedBlock;
        } else if (nodeText === '' && node.children.length === 1) {
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
