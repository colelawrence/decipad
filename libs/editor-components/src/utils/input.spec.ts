import { describe, it, expect, beforeEach } from 'vitest';
import type { MyEditor, SliderElement } from '@decipad/editor-types';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate-common';

import { insertInputBelow, insertSliderInputBelow } from './input';

let editor: MyEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] } as never,
  ];
});

describe('insertInputBelow', () => {
  it('inserts an input element', async () => {
    await insertInputBelow(editor, [0], 'number', () => 'Input1');
    expect(editor.children[1]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      variant: 'expression',
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: 'Input1' }],
        },
        {
          type: ELEMENT_EXPRESSION,
          children: [{ text: '100$' }],
        },
      ],
    });
  });
});

describe('inserts slider below', () => {
  it('inserts a slider element', async () => {
    await insertSliderInputBelow(editor, [0], () => 'Slider1');
    expect(editor.children[1]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      variant: 'slider',
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: 'Slider1' }],
        },
        {
          type: ELEMENT_EXPRESSION,
          children: [{ text: '5' }],
        },
        {
          type: ELEMENT_SLIDER,
          max: '10',
          min: '0',
          step: '1',
          value: '5',
          children: [{ text: '' }],
        } as SliderElement,
      ],
    });
  });
});
