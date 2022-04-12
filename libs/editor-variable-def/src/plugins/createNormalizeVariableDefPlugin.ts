import { nanoid } from 'nanoid';
import {
  ELEMENT_VARIABLE_DEF,
  isElement,
  Node,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  Element,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { Editor, NodeEntry, Transforms } from 'slate';

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
    if ((node as Element)?.type !== ELEMENT_VARIABLE_DEF) {
      return false;
    }

    if (!isElement(node)) {
      return false;
    }

    if (node.children.length < 1) {
      Transforms.insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_CAPTION,
          children: [{ text: '' }],
        } as Node,
        { at: [...path, 0] }
      );
      return true;
    }

    if ((node.children[0] as Element).type !== ELEMENT_CAPTION) {
      Transforms.delete(editor, {
        at: [...path, 0],
      });
      return true;
    }

    if (node.children.length < 2) {
      Transforms.insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_EXPRESSION,
          children: [{ text: '' }],
        } as Node,
        { at: [...path, 1] }
      );
      return true;
    }

    if ((node.children[1] as Element).type !== ELEMENT_EXPRESSION) {
      Transforms.delete(editor, {
        at: [...path, 1],
      });
      return true;
    }

    return false;
  };

export const createNormalizeVariableDefPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_VARIABLE_DEF_PLUGIN',
  elementType: ELEMENT_VARIABLE_DEF,
  acceptableElementProperties: [],
  acceptableSubElements: [ELEMENT_CAPTION, ELEMENT_EXPRESSION],
  plugin: normalize,
});
