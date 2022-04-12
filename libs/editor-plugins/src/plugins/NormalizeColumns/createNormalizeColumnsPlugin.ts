/* eslint-disable no-param-reassign */
import { ELEMENT_COLUMNS, ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { isElement, isText, TDescendant } from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeColumns = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry;
  if (isElement(node) && node.type === ELEMENT_COLUMNS) {
    for (const childEntry of Node.children(editor, path)) {
      const [childNode, childPath] = childEntry as NodeEntry<TDescendant>;

      if (
        isText(childNode) ||
        (isElement(childNode) && childNode.type !== ELEMENT_VARIABLE_DEF)
      ) {
        Transforms.liftNodes(editor, { at: childPath });
        return true;
      }
    }

    if (node.children.length === 0) {
      Transforms.removeNodes(editor, { at: path });
    }
    if (node.children.length === 1) {
      Transforms.unwrapNodes(editor, { at: path });
    }
    return true;
  }

  return false;
};

export const createNormalizeColumnsPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_COLUMNS_PLUGIN',
  elementType: ELEMENT_COLUMNS,
  plugin: normalizeColumns,
});
