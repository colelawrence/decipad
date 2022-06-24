import { normalizeEditor } from '@udecode/plate';
import {
  createTPlateEditor,
  ELEMENT_CAPTION,
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
