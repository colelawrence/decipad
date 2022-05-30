import { nanoid } from 'nanoid';
import {
  CaptionElement,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  ExpressionElement,
  MyEditor,
  MyElement,
  MyNode,
  MyNodeEntry,
  SliderElement,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { deleteText, insertNodes, setNodes } from '@udecode/plate';
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
      deleteText(editor, {
        at: [...path, 0],
      });
      return true;
    }

    if (node.children.length < 2) {
      if (!node.variant || node.variant === 'expression') {
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
      if (node.variant === 'slider') {
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
          { at: [...path, 1] }
        );
        return true;
      }
    }

    if (
      (node.variant === 'expression' &&
        (node.children[1] as MyElement).type !== ELEMENT_EXPRESSION) ||
      (node.variant === 'slider' &&
        (node.children[1] as MyElement).type !== ELEMENT_SLIDER)
    ) {
      deleteText(editor, {
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
