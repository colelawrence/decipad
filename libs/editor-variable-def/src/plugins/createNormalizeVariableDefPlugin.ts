import { nanoid } from 'nanoid';
import {
  CaptionElement,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  ExpressionElement,
  MyEditor,
  MyNode,
  MyNodeEntry,
  SliderElement,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { insertNodes, removeNodes, setNodes } from '@udecode/plate';
import { isElementOfType } from '@decipad/editor-utils';

const allowableVariant = new Set(['expression', 'slider']);

const normalize =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): boolean => {
    if (!isElementOfType(node, ELEMENT_VARIABLE_DEF)) {
      return false;
    }
    if (!('variant' in node) || !allowableVariant.has(node.variant)) {
      setNodes(editor, { variant: 'expression' } as Partial<MyNode>, {
        at: path,
      });
      return true;
    }

    if (node.children.length < 1) {
      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_CAPTION,
          children: [{ text: '' }],
        } as CaptionElement,
        { at: [...path, 0] }
      );
      return true;
    }

    if (node.children[0].type !== ELEMENT_CAPTION) {
      removeNodes(editor, {
        at: [...path, 0],
      });
      return true;
    }

    if (
      node.children.length < 2 &&
      (node.variant === 'expression' || node.variant === 'slider')
    ) {
      insertNodes<ExpressionElement>(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_EXPRESSION,
          children: [{ text: '' }],
        },
        { at: [...path, 1] }
      );
      return true;
    }

    if (
      node.children[1].type !== ELEMENT_EXPRESSION &&
      (node.variant === 'expression' || node.variant === 'slider')
    ) {
      removeNodes(editor, {
        at: [...path, 1],
      });
      return true;
    }

    if (node.variant === 'slider') {
      if (node.children.length < 3) {
        insertNodes<SliderElement>(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_SLIDER,
            max: '10',
            min: '0',
            step: '0.1',
            value: '0',
            children: [{ text: '' }],
          },
          { at: [...path, 2] }
        );
        return true;
      }

      if (node.children[2].type !== ELEMENT_SLIDER) {
        removeNodes(editor, {
          at: [...path, 2],
        });
        return true;
      }
    }

    return false;
  };

export const createNormalizeVariableDefPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_VARIABLE_DEF_PLUGIN',
  elementType: ELEMENT_VARIABLE_DEF,
  acceptableElementProperties: [
    'variant',
    'max',
    'min',
    'step',
    'value',
    'coerceToType',
  ],
  acceptableSubElements: [ELEMENT_CAPTION, ELEMENT_EXPRESSION, ELEMENT_SLIDER],
  plugin: normalize,
});
