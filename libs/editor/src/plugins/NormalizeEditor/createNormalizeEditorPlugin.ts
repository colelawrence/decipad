/* eslint-disable no-param-reassign */
import {
  getPlatePluginWithOverrides,
  insertNodes,
  TNode,
  WithOverride,
  wrapNodes,
} from '@udecode/plate';
import { Editor, Element, NodeEntry, Text, Transforms } from 'slate';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE_INPUT,
  ELEMENT_UL,
} from '../../elements';

const WithNormalizeEditor = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (path.length === 1) {
      if (path[0] === 0) {
        // Enforce leading H1
        if (Text.isText(node)) {
          wrapNodes(editor, { type: ELEMENT_H1, children: [] }, { at: path });
          return;
        }
        if (Element.isElement(node) && node.type !== ELEMENT_H1) {
          Transforms.unwrapNodes(editor, { at: path });
          return;
        }
      } else if (Element.isElement(node) && node.type === ELEMENT_H1) {
        // Forbid H1s elsewhere
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
    }
    // Enforce leading H1 even if there are no elements
    if (Editor.isEditor(node)) {
      if (!node.children.length) {
        insertNodes(
          editor,
          { type: ELEMENT_H1, children: [] },
          { at: [...path, 0] }
        );
        return;
      }
    }

    // Enforce the top-level block allowed elements
    if (path.length === 1) {
      if (Text.isText(node)) {
        wrapNodes(
          editor,
          { type: ELEMENT_PARAGRAPH, children: [] },
          { at: path }
        );
        return;
      }
      if (
        Element.isElement(node) &&
        ![
          ELEMENT_H1,
          ELEMENT_H2,
          ELEMENT_H3,
          ELEMENT_PARAGRAPH,
          ELEMENT_BLOCKQUOTE,
          ELEMENT_CODE_BLOCK,
          ELEMENT_UL,
          ELEMENT_OL,
          ELEMENT_TABLE_INPUT,
          ELEMENT_FETCH,
        ].includes(node.type)
      ) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const createNormalizeEditorPlugin =
  getPlatePluginWithOverrides(WithNormalizeEditor);
