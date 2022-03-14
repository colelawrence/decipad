/* eslint-disable no-param-reassign */
import {
  CodeBlockElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  TNode,
  WithOverride,
  wrapNodes,
} from '@udecode/plate';
import { Element, Node, NodeEntry, Text, Transforms } from 'slate';
import { normalizeExcessProperties } from '../../utils/normalize';
import { codeBlockToCode } from './codeBlockToCode';
import { reconcileStatements } from './reconcileStatements';
import { splitCodeIntoStatements } from './splitCodeIntoStatements';

const withNormalizeCodeBlock = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    // Code line
    if (Element.isElement(node) && node.type === ELEMENT_CODE_LINE) {
      for (const lineChild of Node.children(editor, path)) {
        const [lineChildNode, lineChildPath] = lineChild as NodeEntry<TNode>;

        // Children must be text
        if (Element.isElement(lineChildNode)) {
          Transforms.unwrapNodes(editor, { at: lineChildPath });
          return;
        }

        // Text must be plain
        if (normalizeExcessProperties(editor, lineChild)) {
          return;
        }
      }
    }

    // Code block
    if (Element.isElement(node) && node.type === ELEMENT_CODE_BLOCK) {
      for (const blockChild of Node.children(editor, path)) {
        const [blockChildNode, blockChildPath] = blockChild as NodeEntry<TNode>;

        // Element children must be code lines, else unwrap their text
        if (
          Element.isElement(blockChildNode) &&
          blockChildNode.type !== ELEMENT_CODE_LINE
        ) {
          Transforms.unwrapNodes(editor, { at: blockChildPath });
          return;
        }

        // Text must be wrapped in a code line
        if (Text.isText(blockChildNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_CODE_LINE, children: [] },
            { at: blockChildPath }
          );
          return;
        }
      }

      // At this point the normalization has ensured a matching structure
      const codeBlockNode = node as CodeBlockElement;

      // Split and merge lines to match statements
      const blockCode = codeBlockToCode(codeBlockNode);
      const statements = splitCodeIntoStatements(blockCode);
      if (statements.length) {
        if (reconcileStatements(editor, statements, path)) {
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeCodeBlockPlugin = getPlatePluginWithOverrides(
  withNormalizeCodeBlock
);
