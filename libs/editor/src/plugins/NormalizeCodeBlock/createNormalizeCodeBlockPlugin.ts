/* eslint-disable no-param-reassign */
import { getPlatePluginWithOverrides, WithOverride } from '@udecode/plate';
import { Element, NodeEntry } from 'slate';
import { splitCodeIntoStatements } from './splitCodeIntoStatements';
import { reconcileStatements } from './reconcileStatements';
import { codeBlockToCode } from './codeBlockToCode';
import { Node } from '../../utils/elements';
import { ELEMENT_CODE_BLOCK } from '../../utils/elementTypes';

const withNormalizeCodeBlock = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<Node>;

    // If the element is a code block, ensure its children are valid.
    if (Element.isElement(node) && node.type === ELEMENT_CODE_BLOCK) {
      const blockCode = codeBlockToCode(node);
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
