import type { MyEditor, MyElement, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_EXPRESSION } from '@decipad/editor-types';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import {
  hasNode,
  insertText,
  isElement,
  isText,
  removeNodes,
  unwrapNodes,
} from '@udecode/plate-common';

const normalizeExpression =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): NormalizerReturnValue => {
    if ((node as MyElement)?.type !== ELEMENT_EXPRESSION) {
      return false;
    }

    if (!isElement(node)) {
      return () => unwrapNodes(editor, { at: path });
    }

    if (node.children.length > 1) {
      const p = [...path, 1];
      if (hasNode(editor, p)) {
        return () => removeNodes(editor, { at: p });
      }
    }

    if (!isText(node.children[0])) {
      const p = [...path, 0];
      if (hasNode(editor, p)) {
        return () => removeNodes(editor, { at: p });
      }
    }

    if (node.children.length < 1) {
      return () => {
        try {
          insertText(editor, '', { at: path });
        } catch (err) {
          // do nothing
        }
      };
    }

    return false;
  };

export const createNormalizeExpressionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_EXPRESSION_PLUGIN',
  elementType: ELEMENT_EXPRESSION,
  acceptableElementProperties: [],
  plugin: normalizeExpression,
});
