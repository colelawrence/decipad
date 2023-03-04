import {
  ELEMENT_EXPRESSION,
  MyEditor,
  MyElement,
  MyNodeEntry,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  hasNode,
  insertText,
  isElement,
  isText,
  removeNodes,
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
      const p = [...path, 1];
      if (hasNode(editor, p)) {
        removeNodes(editor, { at: p });
        return true;
      }
    }

    if (!isText(node.children[0])) {
      const p = [...path, 0];
      if (hasNode(editor, p)) {
        removeNodes(editor, { at: p });
        return true;
      }
    }

    if (node.children.length < 1) {
      try {
        insertText(editor, '', { at: path });
        return true;
      } catch (err) {
        // do nothing
      }
    }

    return false;
  };

export const createNormalizeExpressionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_EXPRESSION_PLUGIN',
  elementType: ELEMENT_EXPRESSION,
  acceptableElementProperties: [],
  plugin: normalize,
});
