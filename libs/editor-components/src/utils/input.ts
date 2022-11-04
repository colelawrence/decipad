import {
  DisplayElement,
  ElementVariants,
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
import type { SerializedTypeKind } from '@decipad/computer';
import {
  getEndPoint,
  getStartPoint,
  setSelection,
  insertNodes,
} from '@udecode/plate';
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

const getVariantAndHolder = (
  kind: SerializedTypeKind | undefined
): [ElementVariants, string] => {
  if (kind === 'boolean') return ['toggle', ''];
  if (kind === 'date') return ['date', '2022-11-03'];
  return ['expression', DEFAULT_INPUT_VALUE];
};

export const insertInputBelow = (
  editor: MyEditor,
  path: Path,
  kind: SerializedTypeKind = 'number'
): void => {
  const [variant, placeholder] = getVariantAndHolder(kind);
  const name = getElementUniqueName(editor, ELEMENT_VARIABLE_DEF, 'Input');

  const input = getInitialInputElement({
    kind,
    caption: name,
    value: placeholder,
    variant,
  });
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
