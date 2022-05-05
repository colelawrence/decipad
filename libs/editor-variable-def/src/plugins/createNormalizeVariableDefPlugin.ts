import { nanoid } from 'nanoid';
import {
  ELEMENT_VARIABLE_DEF,
  isElement,
  Node,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  Element,
  ELEMENT_SLIDER,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { Editor, NodeEntry, Transforms } from 'slate';

const allowableVariant = new Set(['expression', 'slider']);

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
    if ((node as Element)?.type !== ELEMENT_VARIABLE_DEF) {
      return false;
    }

    if (!isElement(node)) {
      return false;
    }

    if (!('variant' in node) || !allowableVariant.has(node.variant)) {
      Transforms.setNodes(editor, { variant: 'expression' } as Partial<Node>, {
        at: path,
      });
      return true;
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
      if (!node.variant || node.variant === 'expression') {
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
      if (node.variant === 'slider') {
        Transforms.insertNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_SLIDER,
            max: 10,
            min: 0,
            step: 0.1,
            value: 0,
            children: [{ text: '' }],
          } as Node,
          { at: [...path, 1] }
        );
        return true;
      }
    }

    if (
      (node.variant === 'expression' &&
        (node.children[1] as Element).type !== ELEMENT_EXPRESSION) ||
      (node.variant === 'slider' &&
        (node.children[1] as Element).type !== ELEMENT_SLIDER)
    ) {
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
  acceptableElementProperties: ['variant', 'max', 'min', 'step', 'value'],
  acceptableSubElements: [ELEMENT_CAPTION, ELEMENT_EXPRESSION, ELEMENT_SLIDER],
  plugin: normalize,
});
