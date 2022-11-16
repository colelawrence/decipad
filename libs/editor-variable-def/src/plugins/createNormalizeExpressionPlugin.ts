import {
  ELEMENT_EXPRESSION,
  MyEditor,
  MyElement,
  MyNodeEntry,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  getNodeChildren,
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

    const children = Array.from(getNodeChildren(editor, path));
    for (const lineChild of children) {
      const [lineChildNode, lineChildPath] = lineChild;

      // Children must be text
      if (!isText(lineChildNode)) {
        unwrapNodes(editor, { at: lineChildPath });
        return true;
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
