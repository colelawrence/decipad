import { createPlateEditor } from '@udecode/plate';
import {
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { Editor } from 'slate';
import { createNormalizeVariableDefPlugin } from './createNormalizeVariableDefPlugin';

const varDef = (name = '', value = '') => ({
  type: ELEMENT_VARIABLE_DEF,
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

describe('createNormalizeVariablePlugin', () => {
  it('inserts missing elements', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ type: ELEMENT_VARIABLE_DEF, children: [] }];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([varDef()]);
  });

  it('does not remove valuable attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [varDef('varName', 'valueString')];
    Editor.normalize(editor, { force: true });
    expect(editor.children).toMatchObject([varDef('varName', 'valueString')]);
  });

  it('removes extra attributes', () => {
    const editor = createPlateEditor({
      plugins: [createNormalizeVariableDefPlugin()],
    });
    editor.children = [{ ...varDef(), abc: 'def' }];
    Editor.normalize(editor, { force: true });
    expect(editor.children[0].abc).toBeUndefined();
  });
});
