import type { SerializedTypeKind } from '@decipad/computer';
import { Computer } from '@decipad/computer';
import {
  DisplayElement,
  DropdownElement,
  ELEMENT_CAPTION,
  ELEMENT_DISPLAY,
  ELEMENT_DROPDOWN,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  ElementVariants,
  MyEditor,
  VariableDefinitionElement,
  VariableDropdownElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import {
  insertNodes,
  requirePathBelowBlock,
  setSelection,
} from '@decipad/editor-utils';
import {
  generateDropdownName,
  generateInputName,
  generateSliderName,
} from '@decipad/utils';
import { getEndPoint, getStartPoint } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const DEFAULT_INPUT_VALUE = '100$';
const getInitialInputElement = ({
  caption = '',
  value = '',
  variant = 'expression',
  kind = 'number',
}: {
  caption: string;
  value: string;
  variant: ElementVariants;
  kind: SerializedTypeKind;
}) => {
  return {
    id: nanoid(),
    type: ELEMENT_VARIABLE_DEF,
    variant,
    ...(kind && {
      coerceToType: {
        kind,
        date: 'day',
      },
    }),
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

const getInitialDate = new Date().toISOString().split('T')[0];

const getVariantAndHolder = (
  kind: SerializedTypeKind | undefined
): [ElementVariants, string] => {
  if (kind === 'boolean') return ['toggle', 'false'];
  if (kind === 'date') return ['date', getInitialDate];
  return ['expression', DEFAULT_INPUT_VALUE];
};

export const insertInputBelow = (
  editor: MyEditor,
  path: Path,
  kind: SerializedTypeKind,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  const [variant, placeholder] = getVariantAndHolder(kind);
  const name = getAvailableIdentifier(generateInputName());

  const input = getInitialInputElement({
    kind,
    caption: name,
    value: placeholder,
    variant,
  });
  const insertPath = requirePathBelowBlock(editor, path);

  insertNodes<VariableDefinitionElement>(editor, [input], {
    at: insertPath,
  });

  const valuePath = [...insertPath, 1];
  const valueEnd = getEndPoint(editor, valuePath);
  const valueStart = getStartPoint(editor, valuePath);
  setSelection(editor, { anchor: valueStart, focus: valueEnd });
};

const getSliderInputElement = () => {
  const initialSliderValue = '5';
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
        children: [{ text: initialSliderValue }],
      },
      {
        id: nanoid(),
        type: ELEMENT_SLIDER,
        max: '10',
        min: '0',
        step: '1',
        value: initialSliderValue,
        children: [{ text: '' }],
      },
    ],
  };
};

export const insertSliderInputBelow = (
  editor: MyEditor,
  path: Path,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  const input = getSliderInputElement();
  input.children[0].children[0].text = getAvailableIdentifier(
    generateSliderName()
  );
  insertNodes<VariableSliderElement>(
    editor,
    [input as unknown as VariableSliderElement],
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
  display.varName = 'Result';
  insertNodes(editor, [display], {
    at: requirePathBelowBlock(editor, path),
  });
};

const getDropdownElement = () =>
  ({
    id: nanoid(),
    type: ELEMENT_VARIABLE_DEF,
    variant: 'dropdown',
    coerceToType: {
      kind: 'string',
    },
    children: [
      {
        id: nanoid(),
        type: ELEMENT_CAPTION,
        children: [{ text: generateDropdownName() }],
      },
      {
        id: nanoid(),
        type: ELEMENT_DROPDOWN,
        options: [],
        children: [{ text: 'Select' }],
      } as DropdownElement,
    ],
  } as VariableDropdownElement);

export const insertDropdownBelow = (
  editor: MyEditor,
  path: Path,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  const dropdown = getDropdownElement();
  dropdown.children[0].children[0].text = getAvailableIdentifier(
    generateDropdownName(),
    1
  );
  insertNodes(editor, [dropdown], {
    at: requirePathBelowBlock(editor, path),
  });
};
