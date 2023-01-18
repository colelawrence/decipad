import { normalizeEditor } from '@udecode/plate';
import {
  createTPlateEditor,
  ELEMENT_CAPTION,
  ELEMENT_DROPDOWN,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { createNormalizeVariableDefPlugin } from './createNormalizeVariableDefPlugin';

const expVarDef = (name = '', value = '') => ({
  type: ELEMENT_VARIABLE_DEF,
  variant: 'expression',
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: name }],
    },
    {
      type: ELEMENT_EXPRESSION,
      children: [{ text: value }],
    },
  ],
});

describe('createNormalizeVariablePlugin for variable def expressions', () => {
  it('inserts missing elements', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ type: ELEMENT_VARIABLE_DEF, children: [] } as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([expVarDef()]);
  });

  it('does not remove valuable attributes', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [expVarDef('varName', 'valueString') as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      expVarDef('varName', 'valueString'),
    ]);
  });

  it('removes extra attributes', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ ...expVarDef(), abc: 'def' } as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children[0].abc).toBeUndefined();
  });
});

const sliderVarDef = (name = '', value = '') => ({
  type: ELEMENT_VARIABLE_DEF,
  variant: 'slider',
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: name }],
    },
    {
      type: ELEMENT_EXPRESSION,
      children: [{ text: value }],
    },
    {
      type: ELEMENT_SLIDER,
      max: '10',
      min: '0',
      step: '0.1',
      value: value !== '' ? value : '0',
      children: [{ text: '' }],
    },
  ],
});

describe('createNormalizeVariablePlugin for variable def slider', () => {
  it('inserts missing elements', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [
      { type: ELEMENT_VARIABLE_DEF, variant: 'slider', children: [] } as never,
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([sliderVarDef()]);
  });

  it('does not remove valuable attributes', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [sliderVarDef('varName', '10') as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([sliderVarDef('varName', '10')]);
  });

  it('removes extra attributes', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [
      { ...sliderVarDef(undefined, undefined), abc: 'def' } as never,
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children[0].abc).toBeUndefined();
  });
});

const dropdownVarDef = (name = '') => ({
  type: ELEMENT_VARIABLE_DEF,
  variant: 'dropdown',
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: name }],
    },
    {
      type: ELEMENT_DROPDOWN,
      children: [{ text: '' }],
      options: [] as any[],
    },
  ],
});

describe('createNormalizeVariablePlugin for dropdown elements', () => {
  it('changes options array from strings to objects', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    const myDropdown = dropdownVarDef('hello');
    myDropdown.children[1].options = ['25%', '50%'];
    editor.children = [myDropdown as any];
    normalizeEditor(editor, { force: true });
    expect(editor.children[0]).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'hello',
            },
          ],
          type: 'caption',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          options: [
            {
              value: '25%',
            },
            {
              value: '50%',
            },
          ],
          type: 'dropdown',
        },
      ],
      type: 'def',
      variant: 'dropdown',
    });
  });

  it('adds options array if not present', () => {
    const editor = createTPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    const myDropdown = dropdownVarDef('hello');
    editor.children = [myDropdown as any];
    delete myDropdown.children[1].options;
    normalizeEditor(editor, { force: true });
    expect(editor.children[0]).toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "text": "hello",
              },
            ],
            "type": "caption",
          },
          Object {
            "children": Array [
              Object {
                "text": "",
              },
            ],
            "options": Array [],
            "type": "dropdown",
          },
        ],
        "type": "def",
        "variant": "dropdown",
      }
    `);
  });
});
