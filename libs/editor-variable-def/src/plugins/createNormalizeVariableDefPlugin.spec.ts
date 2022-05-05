import { createPlateEditor } from '@udecode/plate';
import {
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
} from '@decipad/editor-types';
import { Editor } from 'slate';
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
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ type: ELEMENT_VARIABLE_DEF, children: [] }];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([expVarDef()]);
  });

  it('does not remove valuable attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [expVarDef('varName', 'valueString')];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([
      expVarDef('varName', 'valueString'),
    ]);
  });

  it('removes extra attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ ...expVarDef(), abc: 'def' }];
    Editor.normalize(editor, { force: true });
    expect(editor.children[0].abc).toBeUndefined();
  });
});

const sliderVarDef = (name = '', value = 0) => ({
  type: ELEMENT_VARIABLE_DEF,
  variant: 'slider',
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: name }],
    },
    {
      type: ELEMENT_SLIDER,
      max: 10,
      min: 0,
      step: 0.1,
      value,
      children: [{ text: '' }],
    },
  ],
});

describe('createNormalizeVariablePlugin for variable def slider', () => {
  it('inserts missing elements', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [
      { type: ELEMENT_VARIABLE_DEF, variant: 'slider', children: [] },
    ];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([sliderVarDef()]);
  });

  it('does not remove valuable attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [sliderVarDef('varName', 10)];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([sliderVarDef('varName', 10)]);
  });

  it('removes extra attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ ...sliderVarDef(undefined, undefined), abc: 'def' }];
    Editor.normalize(editor, { force: true });
    expect(editor.children[0].abc).toBeUndefined();
  });
});
