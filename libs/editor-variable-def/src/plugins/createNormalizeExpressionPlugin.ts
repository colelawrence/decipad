import {
  ELEMENT_EXPRESSION,
  MyEditor,
  MyElement,
  MyNodeEntry,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  deleteText,
  insertText,
  isElement,
  isText,
  unwrapNodes,
} from '@udecode/plate';

const normalize =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): boolean => {
    if ((node as MyElement)?.type !== ELEMENT_EXPRESSION) {
      return false;
    }

    if (!isElement(node)) {
      unwrapNodes(editor, { at: path });
      return true;
    }

    if (node.children.length > 1) {
      deleteText(editor, { at: [...path, 1] });
      return true;
    }

    if (!isText(node.children[0])) {
      deleteText(editor, { at: [...path, 0] });
      return true;
    }

    if (node.children.length < 1) {
      insertText(editor, '', { at: path });
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
