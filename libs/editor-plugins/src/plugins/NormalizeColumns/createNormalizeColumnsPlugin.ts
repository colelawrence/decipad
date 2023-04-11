/* eslint-disable no-param-reassign */
import {
  ELEMENT_COLUMNS,
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import {
  getNodeChildren,
  isElement,
  isText,
  liftNodes,
  removeNodes,
  unwrapNodes,
} from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';

const normalizeColumns =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isElement(node) && node.type === ELEMENT_COLUMNS) {
      for (const childEntry of getNodeChildren(editor, path)) {
        const [childNode, childPath] = childEntry;

        if (
          isText(childNode) ||
          (isElement(childNode) &&
            childNode.type !== ELEMENT_VARIABLE_DEF &&
            childNode.type !== ELEMENT_DISPLAY)
        ) {
          return () => liftNodes(editor, { at: childPath });
        }
      }

      if (node.children.length === 0) {
        return () => removeNodes(editor, { at: path });
      }
      if (node.children.length === 1) {
        return () => unwrapNodes(editor, { at: path });
      }
    }

    return false;
  };

export const createNormalizeColumnsPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_COLUMNS_PLUGIN',
  elementType: ELEMENT_COLUMNS,
  plugin: normalizeColumns,
});
