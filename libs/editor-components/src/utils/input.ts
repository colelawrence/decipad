import {
  DisplayElement,
  ELEMENT_CAPTION,
  ELEMENT_DISPLAY,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  VariableDefinitionElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import {
  getElementUniqueName,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import {
  getEndPoint,
  getStartPoint,
  insertNodes,
  setSelection,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const DEFAULT_INPUT_VALUE = '100$';
const getInitialInputElement = (caption = '', value = '') => {
  return {
    id: nanoid(),
    type: ELEMENT_VARIABLE_DEF,
    variant: 'expression',
    children: [
      {
        id: nanoid(),
        type: ELEMENT_CAPTION,
        children: [{ text: caption }],
      },
      {
        id: nanoid(),
        type: ELEMENT_EXPRESSION,
        children: [{ text: value }],
      },
    ],
  } as VariableDefinitionElement;
};

export const insertInputBelow = (editor: MyEditor, path: Path): void => {
  const name = getElementUniqueName(
    editor,
    ELEMENT_VARIABLE_DEF,
    'expression',
    'Input'
  );

  const input = getInitialInputElement(name, DEFAULT_INPUT_VALUE);
  const insertPath = requirePathBelowBlock(editor, path);

  insertNodes<VariableDefinitionElement>(editor, input, {
    at: insertPath,
  });

  const valuePath = [...insertPath, 1];
  const valueEnd = getEndPoint(editor, valuePath);
  const valueStart = getStartPoint(editor, valuePath);
  setSelection(editor, { anchor: valueStart, focus: valueEnd });
};

const getSliderInputElement = () => {
  return {
    id: nanoid(),
    type: ELEMENT_VARIABLE_DEF,
    variant: 'slider',
    children: [
      {
        id: nanoid(),
        type: ELEMENT_CAPTION,
        children: [{ text: '' }],
      },
      {
        id: nanoid(),
        type: ELEMENT_EXPRESSION,
        children: [{ text: '' }],
      },
      {
        id: nanoid(),
        type: ELEMENT_SLIDER,
        max: '10',
        min: '0',
        step: '1',
        value: '0',
        children: [{ text: '' }],
      },
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

const getDisplayElement = () => {
  return {
    id: nanoid(),
    blockId: '',
    type: ELEMENT_DISPLAY,
    children: [{ text: '' }],
  } as DisplayElement;
};

export const insertDisplayBelow = (editor: MyEditor, path: Path): void => {
  const display = getDisplayElement();
  insertNodes(editor, display, {
    at: requirePathBelowBlock(editor, path),
  });
};
