import {
  CaptionElement,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  SliderElement,
  VariableDefinitionElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import { insertNodes } from '@udecode/plate';
import { Path } from 'slate';
import {
  requirePathBelowBlock,
  getElementUniqueName,
} from '@decipad/editor-utils';

const getInitialInputElement = () => {
  return {
    type: ELEMENT_VARIABLE_DEF,
    variant: 'expression',
    children: [
      {
        type: ELEMENT_CAPTION,
        children: [{ text: '' }],
      },
      {
        type: ELEMENT_EXPRESSION,
        children: [{ text: '' }],
      },
    ],
  } as VariableDefinitionElement;
};

export const insertInputBelow = (editor: MyEditor, path: Path): void => {
  const input = getInitialInputElement();
  input.children[0].children[0].text = getElementUniqueName(
    editor,
    ELEMENT_VARIABLE_DEF,
    'expression',
    'Input'
  );
  insertNodes<VariableDefinitionElement>(editor, input, {
    at: requirePathBelowBlock(editor, path),
  });
};

const getSliderInputElement = () => {
  return {
    type: ELEMENT_VARIABLE_DEF,
    variant: 'slider',
    children: [
      {
        type: ELEMENT_CAPTION,
        children: [{ text: '' }],
      } as CaptionElement,
      {
        type: ELEMENT_EXPRESSION,
        children: [{ text: '' }],
      },
      {
        type: ELEMENT_SLIDER,
        max: '10',
        min: '0',
        step: '1',
        value: '0',
        children: [{ text: '' }],
      } as SliderElement,
    ],
  };
};

export const insertSliderInputBelow = (editor: MyEditor, path: Path): void => {
  const input = getSliderInputElement();
  input.children[0].children[0].text = getElementUniqueName(
    editor,
    ELEMENT_VARIABLE_DEF,
    'slider',
    'Slider'
  );
  insertNodes<VariableSliderElement>(
    editor,
    input as unknown as VariableSliderElement,
    {
      at: requirePathBelowBlock(editor, path),
    }
  );
};
