/* eslint-disable no-param-reassign */
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@decipad/editor-types';
import {
  insertNodes,
  isElement,
  isText,
  TNode,
  wrapNodes,
} from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeList = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (
    isElement(node) &&
    (node.type === ELEMENT_UL || node.type === ELEMENT_OL)
  ) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    for (const childEntry of Node.children(editor, path)) {
      const [childNode, childPath] = childEntry as NodeEntry<TNode>;

      if (isElement(childNode) && childNode.type !== ELEMENT_LI) {
        Transforms.unwrapNodes(editor, { at: childPath });
        return true;
      }

      if (isText(childNode)) {
        wrapNodes(
          editor,
          { type: ELEMENT_LI, children: [] },
          { at: childPath }
        );
        return true;
      }
    }
  }

  if (isElement(node) && node.type === ELEMENT_LI) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    const [licChild, listChild, ...furtherChildren] = Node.children(
      editor,
      path
    );

    // LIC child
    if (!licChild) {
      insertNodes(
        editor,
        { type: ELEMENT_LIC, children: [{ text: '' }] },
        { at: [...path, 0] }
      );
      return true;
    }

    const [licChildNode, licChildPath] = licChild as NodeEntry<TNode>;

    if (isElement(licChildNode) && licChildNode.type !== ELEMENT_LIC) {
      Transforms.unwrapNodes(editor, { at: licChildPath });
      return true;
    }

    if (isText(licChildNode)) {
      wrapNodes(
        editor,
        { type: ELEMENT_LIC, children: [] },
        { at: licChildPath }
      );
      return true;
    }

    // Optional list child
    if (listChild) {
      const [listChildNode, listChildPath] = listChild as NodeEntry<TNode>;
      if (
        !(
          isElement(listChildNode) &&
          (listChildNode.type === ELEMENT_UL ||
            listChildNode.type === ELEMENT_OL)
        )
      ) {
        Transforms.delete(editor, { at: listChildPath });
        return true;
      }

      if (furtherChildren.length) {
        // Further children not allowed
        const furtherChildEntry = furtherChildren[0] as NodeEntry<TNode>;
        const [, furtherChildPath] = furtherChildEntry;
        Transforms.delete(editor, { at: furtherChildPath });
        return true;
      }
    }
  }

  return false;
};
export const createNormalizeListPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LIST_PLUGIN',
  plugin: normalizeList,
});
