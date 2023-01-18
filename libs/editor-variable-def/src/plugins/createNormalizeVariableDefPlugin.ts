import { nanoid } from 'nanoid';
import {
  CaptionElement,
  ELEMENT_CAPTION,
  ELEMENT_DROPDOWN,
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
import { removeNodes, setNodes } from '@udecode/plate';
import { insertNodes, isElementOfType } from '@decipad/editor-utils';

const allowableVariant = new Set([
  'expression',
  'slider',
  'toggle',
  'date',
  'dropdown',
]);

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

    if (node.children.length < 2) {
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
      (node.children[1].type !== ELEMENT_EXPRESSION &&
        node.variant !== 'dropdown') ||
      (node.children[1].type !== ELEMENT_DROPDOWN &&
        node.variant === 'dropdown')
    ) {
      removeNodes(editor, {
        at: [...path, 1],
      });
      return true;
    }

    // Dropdown options used to just be an array of strings.
    // So we have to normalize them to be the objects they are now.
    if (node.children[1].type === ELEMENT_DROPDOWN) {
      const newOptions: Array<{ id: string; value: string }> = [];
      let changed = false;

      if (!('options' in node.children[1]) || !node.children[1].options) {
        setNodes(editor, { options: [] }, { at: [...path, 1] });
        return true;
      }

      for (const op of node.children[1].options) {
        if (typeof op === 'string') {
          newOptions.push({
            id: nanoid(),
            value: op as string, // Safe casting, they used to be strings.
          });
          changed = true;
          continue;
        }
        newOptions.push(op);
      }
      if (changed) {
        setNodes(editor, { options: newOptions } as Partial<MyNode>, {
          at: [...path, 1],
        });
        return true;
      }
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

    const num = node.variant === 'slider' ? 3 : 2;
    if (node.children.length > num) {
      // HACK: This particular removal seems to always happen concurrently during a re-render that
      // will then fail to get the node and break the app. Using a timeout fixes it. Unfortunately
      // it cannot fix my pride.
      setTimeout(() => {
        removeNodes(editor, {
          at: [...path, node.children.length - 1],
        });
      });
    }

    return false;
  };

export const createNormalizeVariableDefPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_VARIABLE_DEF_PLUGIN',
  elementType: ELEMENT_VARIABLE_DEF,
  acceptableSubElements: [
    ELEMENT_CAPTION,
    ELEMENT_EXPRESSION,
    ELEMENT_SLIDER,
    ELEMENT_DROPDOWN,
  ],
  acceptableElementProperties: [
    'variant',
    'max',
    'min',
    'step',
    'value',
    'coerceToType',
  ],
  plugin: normalize,
});
