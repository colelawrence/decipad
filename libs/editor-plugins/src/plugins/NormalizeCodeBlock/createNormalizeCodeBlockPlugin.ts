/* eslint-disable no-param-reassign */
import {
  CodeBlockElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { TNode, wrapNodes } from '@udecode/plate';
import { Editor, Element, Node, NodeEntry, Text, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { codeBlockToCode } from './codeBlockToCode';
import { reconcileStatements } from './reconcileStatements';
import { splitCodeIntoStatements } from './splitCodeIntoStatements';

const normalizeCodeBlock = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  // Code block legacy component
  if (Element.isElement(node) && node.type === ELEMENT_CODE_BLOCK) {
    for (const blockChild of Node.children(editor, path)) {
      const [blockChildNode, blockChildPath] = blockChild as NodeEntry<TNode>;

      // Element children must be code lines, else unwrap their text
      if (
        Element.isElement(blockChildNode) &&
        blockChildNode.type !== ELEMENT_CODE_LINE
      ) {
        Transforms.unwrapNodes(editor, { at: blockChildPath });
        return true;
      }

      // Text must be wrapped in a code line
      if (Text.isText(blockChildNode)) {
        wrapNodes(
          editor,
          { type: ELEMENT_CODE_LINE, children: [] },
          { at: blockChildPath }
        );
        return true;
      }
    }

    // At this point the normalization has ensured a matching structure
    const codeBlockNode = node as CodeBlockElement;

    // Split and merge lines to match statements
    const blockCode = codeBlockToCode(codeBlockNode);
    const statements = splitCodeIntoStatements(blockCode);
    if (statements.length) {
      if (reconcileStatements(editor, statements, path)) {
        return true;
      }
    }

    // We don't use code blocks anymore so we unwrap their code lines.
    Transforms.unwrapNodes(editor, { at: path });
    return true;
  }
  return false;
};

export const createNormalizeCodeBlockPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CODE_BLOCK_PLUGIN',
  elementType: ELEMENT_CODE_BLOCK,
  acceptableSubElements: [ELEMENT_CODE_LINE],
  plugin: normalizeCodeBlock,
});
