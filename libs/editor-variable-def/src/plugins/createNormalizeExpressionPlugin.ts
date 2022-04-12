import {
  isElement,
  Element,
  isText,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { Editor, NodeEntry, Transforms } from 'slate';

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
    if ((node as Element)?.type !== ELEMENT_EXPRESSION) {
      return false;
    }

    if (!isElement(node)) {
      Transforms.unwrapNodes(editor, { at: path });
      return true;
    }

    if (node.children.length > 1) {
      Transforms.delete(editor, { at: [...path, 1] });
      return true;
    }

    if (!isText(node.children[0])) {
      Transforms.delete(editor, { at: [...path, 0] });
      return true;
    }

    if (node.children.length < 1) {
      Transforms.insertText(editor, '', { at: path });
      return true;
    }

    return false;
  };

export const createNormalizeExpressionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_EXPRESSION_PLUGIN',
  elementType: ELEMENT_EXPRESSION,
  acceptableElementProperties: [],
  plugin: normalize,
});
