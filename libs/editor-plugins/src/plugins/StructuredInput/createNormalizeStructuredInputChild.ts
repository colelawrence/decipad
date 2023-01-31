import {
  ELEMENT_STRUCTURED_IN_CHILD,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { isElement, unwrapNodes, isText } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

export const createNormalizeStructuredInputChild =
  createNormalizerPluginFactory({
    name: 'NORMALIZE_STRUCTURED_INPUT_CHILD',
    elementType: ELEMENT_STRUCTURED_IN_CHILD,
    plugin:
      (editor: MyEditor) =>
      (entry: MyNodeEntry): boolean => {
        const [node, path] = entry;
        if (isElement(node) && node.type !== ELEMENT_STRUCTURED_IN_CHILD) {
          return false;
        }

        if (!isElement(node)) {
          unwrapNodes(editor, { at: path });
          return true;
        }

        if (node.children.length > 1) {
          unwrapNodes(editor, { at: [...path, node.children.length - 1] });
          return true;
        }

        if (node.children.length < 1) {
          insertNodes(editor, { text: '' }, { at: [...path, 0] });
          return true;
        }

        if (!isText(node.children[0])) {
          unwrapNodes(editor, { at: [...path, 0] });
          return true;
        }

        return true;
      },
  });
