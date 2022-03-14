/* eslint-disable no-param-reassign */
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  insertNodes,
  isElement,
  isText,
  TNode,
  WithOverride,
  wrapNodes,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { normalizeExcessProperties } from '../../utils/normalize';

const withNormalizeList = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (
      isElement(node) &&
      (node.type === ELEMENT_UL || node.type === ELEMENT_OL)
    ) {
      if (normalizeExcessProperties(editor, entry)) {
        return;
      }

      for (const childEntry of Node.children(editor, path)) {
        const [childNode, childPath] = childEntry as NodeEntry<TNode>;

        if (isElement(childNode) && childNode.type !== ELEMENT_LI) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }

        if (isText(childNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_LI, children: [] },
            { at: childPath }
          );
          return;
        }
      }
    }

    if (isElement(node) && node.type === ELEMENT_LI) {
      if (normalizeExcessProperties(editor, entry)) {
        return;
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
        return;
      }

      const [licChildNode, licChildPath] = licChild as NodeEntry<TNode>;

      if (isElement(licChildNode) && licChildNode.type !== ELEMENT_LIC) {
        Transforms.unwrapNodes(editor, { at: licChildPath });
        return;
      }

      if (isText(licChildNode)) {
        wrapNodes(
          editor,
          { type: ELEMENT_LIC, children: [] },
          { at: licChildPath }
        );
        return;
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
          return;
        }

        if (furtherChildren.length) {
          // Further children not allowed
          const furtherChildEntry = furtherChildren[0] as NodeEntry<TNode>;
          const [, furtherChildPath] = furtherChildEntry;
          Transforms.delete(editor, { at: furtherChildPath });
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeListPlugin =
  getPlatePluginWithOverrides(withNormalizeList);
