import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  VariableDefinitionElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from '@decipad/editor-utils';

const inputElement = {
  type: ELEMENT_VARIABLE_DEF,
  variant: 'input',
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
} as unknown as VariableDefinitionElement;

export const insertInputBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, inputElement, {
    at: requirePathBelowBlock(editor, path),
  });
};

const sliderInputElement = {
  type: ELEMENT_VARIABLE_DEF,
  variant: 'slider',
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_SLIDER,
      max: 10,
      min: 0,
      step: 1,
      value: 0,
      children: [{ text: '' }],
    },
  ],
} as VariableSliderElement;

export const insertSliderInputBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, sliderInputElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
