import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  SliderElement,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';

import { insertInputBelow, insertSliderInputBelow } from './input';

let editor: MyEditor;
beforeEach(() => {
  editor = createPlateEditor();
  editor.children = [
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] } as never,
  ];
});

describe('insertInputBelow', () => {
  it('inserts an input element', () => {
    insertInputBelow(editor, [0]);
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
          children: [{ text: '' }],
        },
      ],
    });
  });

  it('inserts an 2 inputs and they should both have different names', () => {
    insertInputBelow(editor, [0]);
    insertInputBelow(editor, [1]);
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
          children: [{ text: '' }],
        },
      ],
    });
    expect(editor.children[2]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      variant: 'expression',
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: 'Input2' }],
        },
        {
          type: ELEMENT_EXPRESSION,
          children: [{ text: '' }],
        },
      ],
    });
  });
});

describe('inserts slider below', () => {
  it('inserts a slider element', () => {
    insertSliderInputBelow(editor, [0]);
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
    });
  });

  it('inserts 2 sliders and they should both have different names', () => {
    insertSliderInputBelow(editor, [0]);
    insertSliderInputBelow(editor, [1]);
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
    });
    expect(editor.children[2]).toMatchObject({
      type: ELEMENT_VARIABLE_DEF,
      variant: 'slider',
      children: [
        {
          type: ELEMENT_CAPTION,
          children: [{ text: 'Slider2' }],
        },
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
    });
  });
});
